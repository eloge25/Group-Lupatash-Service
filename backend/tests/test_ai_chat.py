"""AI chat + admin draft-reply tests (Claude Haiku 4.5 via Emergent LLM key).

Kept economical: ~5 LLM calls total (multi-turn FR x2, EN x1, draft x1, regenerate x1).
"""
import os
import time
import uuid
import json
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://import-export-gls.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@gls-douane.com"
ADMIN_PASSWORD = "GlsAdmin2019!"


def _xff():
    """Unique X-Forwarded-For per test to avoid rate-limiter cross-talk."""
    return {"X-Forwarded-For": f"10.99.{int(time.time()) % 255}.{uuid.uuid4().int % 255}"}


def _stream_sse(resp, timeout=45):
    """Consume SSE stream, returns (full_text, deltas_count, done_seen)."""
    deltas = 0
    parts = []
    done = False
    start = time.time()
    for line in resp.iter_lines(decode_unicode=True):
        if time.time() - start > timeout:
            break
        if not line:
            continue
        if line.startswith("data: "):
            payload = line[6:]
            if payload == "[DONE]":
                done = True
                break
            try:
                data = json.loads(payload)
                if "delta" in data:
                    parts.append(data["delta"])
                    deltas += 1
            except json.JSONDecodeError:
                pass
    return "".join(parts), deltas, done


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        headers=_xff(),
        timeout=15,
    )
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


# ---------- Public /api/chat ----------
class TestChat:
    def test_validation_message_too_long(self):
        r = requests.post(
            f"{BASE_URL}/api/chat",
            json={"session_id": "sess-abcdefgh", "message": "x" * 2001, "lang": "fr"},
            headers=_xff(),
            timeout=10,
        )
        assert r.status_code == 422

    def test_validation_session_id_too_short(self):
        r = requests.post(
            f"{BASE_URL}/api/chat",
            json={"session_id": "short", "message": "hi", "lang": "fr"},
            headers=_xff(),
            timeout=10,
        )
        assert r.status_code == 422

    def test_multiturn_memory_and_no_markdown(self):
        session_id = f"pytest-{uuid.uuid4().hex[:12]}"
        headers = {**_xff(), "Accept": "text/event-stream"}

        # Turn 1 (FR)
        r1 = requests.post(
            f"{BASE_URL}/api/chat",
            json={"session_id": session_id, "message": "Quels sont vos services ?", "lang": "fr"},
            headers=headers,
            stream=True,
            timeout=60,
        )
        assert r1.status_code == 200
        assert "text/event-stream" in r1.headers.get("content-type", "")
        text1, n1, done1 = _stream_sse(r1)
        assert done1, "Turn1: [DONE] not received"
        assert n1 >= 1, "Turn1: no deltas"
        assert len(text1) > 20, f"Turn1 too short: {text1!r}"
        # Plain text — no markdown bold
        assert "**" not in text1, f"Markdown ** leaked: {text1!r}"
        assert "##" not in text1

        time.sleep(1.5)

        # Turn 2 references turn 1 — needs memory
        r2 = requests.post(
            f"{BASE_URL}/api/chat",
            json={
                "session_id": session_id,
                "message": "Quel etait le premier service que tu as cite ?",
                "lang": "fr",
            },
            headers=headers,
            stream=True,
            timeout=60,
        )
        assert r2.status_code == 200
        text2, n2, done2 = _stream_sse(r2)
        assert done2
        assert len(text2) > 10
        assert "**" not in text2

        # History endpoint
        h = requests.get(f"{BASE_URL}/api/chat/history/{session_id}", headers=_xff(), timeout=10)
        assert h.status_code == 200
        hist = h.json()
        assert len(hist) == 4, f"Expected 4 msgs, got {len(hist)}: {hist}"
        assert [m["role"] for m in hist] == ["user", "assistant", "user", "assistant"]
        assert hist[0]["content"].startswith("Quels sont vos services")

        # Memory heuristic: turn 2 should reference a service word from turn 1
        service_words = ["dedouan", "dédouan", "import", "export", "transport",
                         "transit", "inspection", "entrepos", "scan"]
        t1_low = text1.lower()
        t2_low = text2.lower()
        overlap = [w for w in service_words if w in t1_low and w in t2_low]
        assert overlap, f"No shared service term between turns.\nT1={text1}\nT2={text2}"

    def test_english_lang(self):
        session_id = f"pytest-en-{uuid.uuid4().hex[:10]}"
        r = requests.post(
            f"{BASE_URL}/api/chat",
            json={"session_id": session_id, "message": "What services do you offer?", "lang": "en"},
            headers={**_xff(), "Accept": "text/event-stream"},
            stream=True,
            timeout=60,
        )
        assert r.status_code == 200
        text, n, done = _stream_sse(r)
        assert done
        assert len(text) > 20
        # Rough English heuristic
        low = text.lower()
        english_hits = sum(w in low for w in [" the ", " we ", " our ", " and ", " you ", " services"])
        french_hits = sum(w in low for w in [" nos ", " nous ", " et ", " vous ", " les "])
        assert english_hits >= french_hits, f"Expected English answer, got: {text!r}"


# ---------- Admin /api/admin/draft-reply ----------
class TestDraftReply:
    def test_requires_auth(self):
        r = requests.post(
            f"{BASE_URL}/api/admin/draft-reply/507f1f77bcf86cd799439011",
            headers=_xff(),
            timeout=10,
        )
        assert r.status_code == 401

    def test_invalid_message_id_returns_404(self, admin_token):
        r = requests.post(
            f"{BASE_URL}/api/admin/draft-reply/507f1f77bcf86cd799439099",
            headers={**_xff(), "Authorization": f"Bearer {admin_token}"},
            timeout=15,
        )
        # 404 from missing or bad ObjectId
        assert r.status_code == 404

    def test_draft_flow_creates_french_email(self, admin_token):
        # Create a contact message
        c = requests.post(
            f"{BASE_URL}/api/contact",
            json={
                "name": "TEST_AI_Client",
                "email": "test_ai_client@example.com",
                "phone": "",
                "company": "TEST Co",
                "subject": "Dedouanement vehicule",
                "message": "Bonjour, je souhaite dedouaner un vehicule importe. Merci de me guider.",
            },
            headers=_xff(),
            timeout=10,
        )
        assert c.status_code == 200, c.text
        msg_id = c.json()["id"]

        try:
            # List messages (as admin) — verify present
            lst = requests.get(
                f"{BASE_URL}/api/contact/messages",
                headers={**_xff(), "Authorization": f"Bearer {admin_token}"},
                timeout=10,
            )
            assert lst.status_code == 200
            assert any(m["id"] == msg_id for m in lst.json())

            # Request draft
            d = requests.post(
                f"{BASE_URL}/api/admin/draft-reply/{msg_id}",
                headers={**_xff(), "Authorization": f"Bearer {admin_token}"},
                stream=True,
                timeout=60,
            )
            assert d.status_code == 200
            assert "text/event-stream" in d.headers.get("content-type", "")
            text, n, done = _stream_sse(d)
            assert done, "[DONE] not received on draft stream"
            assert n >= 1
            assert len(text) > 40
            assert "**" not in text, f"Markdown leaked in draft: {text!r}"
            # French signature
            assert "GLS" in text
            low = text.lower()
            french_markers = ["bonjour", "madame", "monsieur", "cordialement",
                              "salutations", "equipe", "équipe", "nous vous"]
            assert any(m in low for m in french_markers), f"Draft not clearly French: {text!r}"
        finally:
            # Cleanup
            requests.delete(
                f"{BASE_URL}/api/contact/messages/{msg_id}",
                headers={**_xff(), "Authorization": f"Bearer {admin_token}"},
                timeout=10,
            )
