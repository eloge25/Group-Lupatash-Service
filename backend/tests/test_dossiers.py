"""GLS dossier & tracking API tests."""
import os
import re
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@gls-douane.com"
ADMIN_PASSWORD = "GlsAdmin2019!"

REF_RE = re.compile(r"^GLS-\d{4}-[A-Z0-9]{4}$")


@pytest.fixture(scope="module")
def auth_headers():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}", "Content-Type": "application/json"}


@pytest.fixture(scope="module")
def created_dossier(auth_headers):
    payload = {
        "client_name": "TEST_Client",
        "company": "TEST_Co",
        "description": "TEST desc",
        "origin": "Dubai",
        "destination": "Lubumbashi",
    }
    r = requests.post(f"{API}/dossiers", json=payload, headers=auth_headers)
    assert r.status_code in (200, 201), r.text
    d = r.json()
    yield d
    # cleanup
    requests.delete(f"{API}/dossiers/{d['id']}", headers=auth_headers)


class TestDossierCRUD:
    def test_create_requires_auth(self):
        r = requests.post(f"{API}/dossiers", json={"client_name": "x"})
        assert r.status_code == 401

    def test_create_dossier(self, created_dossier):
        d = created_dossier
        assert REF_RE.match(d["reference"]), f"Bad reference: {d['reference']}"
        assert d["reference"].startswith("GLS-2026-")
        assert d["status"] == "recu"
        assert d["client_name"] == "TEST_Client"
        assert isinstance(d["history"], list) and len(d["history"]) == 1
        assert d["history"][0]["status"] == "recu"
        assert "id" in d and isinstance(d["id"], str)
        # ensure no ObjectId leaked
        assert "_id" not in d

    def test_list_dossiers(self, auth_headers, created_dossier):
        r = requests.get(f"{API}/dossiers", headers=auth_headers)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list) and len(items) >= 1
        assert all("_id" not in x for x in items)
        assert any(x["id"] == created_dossier["id"] for x in items)

    def test_list_requires_auth(self):
        r = requests.get(f"{API}/dossiers")
        assert r.status_code == 401

    def test_update_status_valid(self, auth_headers, created_dossier):
        r = requests.patch(
            f"{API}/dossiers/{created_dossier['id']}",
            json={"status": "declaration", "note": "TEST note"},
            headers=auth_headers,
        )
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "declaration"
        assert len(d["history"]) >= 2
        assert d["history"][-1]["status"] == "declaration"
        assert d["history"][-1]["note"] == "TEST note"

    def test_update_status_invalid(self, auth_headers, created_dossier):
        r = requests.patch(
            f"{API}/dossiers/{created_dossier['id']}",
            json={"status": "invalid_status", "note": ""},
            headers=auth_headers,
        )
        assert r.status_code == 400


class TestPublicTracking:
    def test_track_public_no_auth(self, created_dossier):
        ref = created_dossier["reference"]
        r = requests.get(f"{API}/track/{ref}")
        assert r.status_code == 200
        d = r.json()
        assert d["reference"] == ref
        assert "id" not in d  # id field stripped for public
        assert "history" in d and isinstance(d["history"], list)

    def test_track_case_insensitive(self, created_dossier):
        ref = created_dossier["reference"]
        r = requests.get(f"{API}/track/{ref.lower()}")
        assert r.status_code == 200
        assert r.json()["reference"] == ref

    def test_track_unknown_returns_404(self):
        r = requests.get(f"{API}/track/GLS-2026-ZZZZ")
        assert r.status_code == 404
        detail = r.json().get("detail", "")
        assert "dossier" in detail.lower() or "aucun" in detail.lower()


class TestDossierDelete:
    def test_delete_requires_auth(self, created_dossier):
        r = requests.delete(f"{API}/dossiers/{created_dossier['id']}")
        assert r.status_code == 401

    def test_delete_and_verify_gone(self, auth_headers):
        # create a new one to delete
        r = requests.post(
            f"{API}/dossiers",
            json={"client_name": "TEST_ToDelete", "origin": "X", "destination": "Y"},
            headers=auth_headers,
        )
        assert r.status_code == 200
        d = r.json()
        ref = d["reference"]
        rid = d["id"]

        r = requests.delete(f"{API}/dossiers/{rid}", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["success"] is True

        # tracking should now 404
        r = requests.get(f"{API}/track/{ref}")
        assert r.status_code == 404
