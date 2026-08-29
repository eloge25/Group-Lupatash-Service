from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, BeforeValidator
from typing import List, Optional, Annotated
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import logging
import bcrypt
import jwt
import secrets
import string

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------- Helpers ----------
PyObjectId = Annotated[str, BeforeValidator(str)]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    token = auth_header[7:] if auth_header.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Non authentifié")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="Utilisateur introuvable")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expirée")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Jeton invalide")


# ---------- Models ----------
class LoginInput(BaseModel):
    email: EmailStr
    password: str


class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    company: Optional[str] = ""
    subject: Optional[str] = ""
    message: str


class ContactMessage(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = ""
    company: Optional[str] = ""
    subject: Optional[str] = ""
    message: str
    read: bool = False
    created_at: str


DOSSIER_STATUSES = ["recu", "documents", "declaration", "liquidation", "libere", "livre"]


class DossierCreate(BaseModel):
    client_name: str
    company: Optional[str] = ""
    description: Optional[str] = ""
    origin: Optional[str] = ""
    destination: Optional[str] = ""


class DossierUpdate(BaseModel):
    status: str
    note: Optional[str] = ""


def serialize_dossier(d: dict) -> dict:
    return {
        "id": str(d["_id"]),
        "reference": d["reference"],
        "client_name": d.get("client_name", ""),
        "company": d.get("company", ""),
        "description": d.get("description", ""),
        "origin": d.get("origin", ""),
        "destination": d.get("destination", ""),
        "status": d.get("status", "recu"),
        "history": d.get("history", []),
        "created_at": d.get("created_at", ""),
        "updated_at": d.get("updated_at", ""),
    }


async def generate_reference() -> str:
    while True:
        suffix = "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(4))
        ref = f"GLS-{datetime.now(timezone.utc).year}-{suffix}"
        if not await db.dossiers.find_one({"reference": ref}):
            return ref


# ---------- Auth routes ----------
@api_router.post("/auth/login")
async def login(data: LoginInput):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    token = create_access_token(str(user["_id"]), user["email"])
    return {
        "access_token": token,
        "user": {"id": str(user["_id"]), "email": user["email"], "name": user.get("name", "Admin")},
    }


@api_router.get("/auth/me")
async def me(current_user: dict = Depends(get_current_user)):
    return {"id": current_user["_id"], "email": current_user["email"], "name": current_user.get("name", "Admin")}


# ---------- Contact routes ----------
@api_router.post("/contact")
async def create_contact(data: ContactCreate):
    doc = data.model_dump()
    doc["read"] = False
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.contacts.insert_one(doc)
    return {"success": True, "id": str(result.inserted_id)}


@api_router.get("/contact/messages", response_model=List[ContactMessage])
async def list_messages(current_user: dict = Depends(get_current_user)):
    messages = await db.contacts.find().sort("created_at", -1).to_list(1000)
    return [
        ContactMessage(
            id=str(m["_id"]),
            name=m.get("name", ""),
            email=m.get("email", ""),
            phone=m.get("phone", ""),
            company=m.get("company", ""),
            subject=m.get("subject", ""),
            message=m.get("message", ""),
            read=m.get("read", False),
            created_at=m.get("created_at", ""),
        )
        for m in messages
    ]


@api_router.patch("/contact/messages/{msg_id}/read")
async def mark_read(msg_id: str, current_user: dict = Depends(get_current_user)):
    await db.contacts.update_one({"_id": ObjectId(msg_id)}, {"$set": {"read": True}})
    return {"success": True}


@api_router.delete("/contact/messages/{msg_id}")
async def delete_message(msg_id: str, current_user: dict = Depends(get_current_user)):
    await db.contacts.delete_one({"_id": ObjectId(msg_id)})
    return {"success": True}


@api_router.get("/contact/stats")
async def stats(current_user: dict = Depends(get_current_user)):
    total = await db.contacts.count_documents({})
    unread = await db.contacts.count_documents({"read": False})
    return {"total": total, "unread": unread}


# ---------- Dossier routes ----------
@api_router.post("/dossiers")
async def create_dossier(data: DossierCreate, current_user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    doc = data.model_dump()
    doc["reference"] = await generate_reference()
    doc["status"] = "recu"
    doc["history"] = [{"status": "recu", "note": "Dossier créé et enregistré", "date": now}]
    doc["created_at"] = now
    doc["updated_at"] = now
    await db.dossiers.insert_one(doc)
    return serialize_dossier(doc)


@api_router.get("/dossiers")
async def list_dossiers(current_user: dict = Depends(get_current_user)):
    dossiers = await db.dossiers.find().sort("created_at", -1).to_list(1000)
    return [serialize_dossier(d) for d in dossiers]


@api_router.patch("/dossiers/{dossier_id}")
async def update_dossier(dossier_id: str, data: DossierUpdate, current_user: dict = Depends(get_current_user)):
    if data.status not in DOSSIER_STATUSES:
        raise HTTPException(status_code=400, detail="Statut invalide")
    now = datetime.now(timezone.utc).isoformat()
    result = await db.dossiers.find_one_and_update(
        {"_id": ObjectId(dossier_id)},
        {
            "$set": {"status": data.status, "updated_at": now},
            "$push": {"history": {"status": data.status, "note": data.note or "", "date": now}},
        },
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Dossier introuvable")
    return serialize_dossier(result)


@api_router.delete("/dossiers/{dossier_id}")
async def delete_dossier(dossier_id: str, current_user: dict = Depends(get_current_user)):
    await db.dossiers.delete_one({"_id": ObjectId(dossier_id)})
    return {"success": True}


@api_router.get("/track/{reference}")
async def track_dossier(reference: str):
    dossier = await db.dossiers.find_one({"reference": reference.strip().upper()})
    if not dossier:
        raise HTTPException(status_code=404, detail="Aucun dossier trouvé avec cette référence")
    d = serialize_dossier(dossier)
    d.pop("id", None)
    return d


@api_router.get("/")
async def root():
    return {"message": "GLS API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin GLS",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin seeded")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
