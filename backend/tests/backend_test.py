"""GLS backend API tests: contact + auth + admin message management."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://import-export-gls.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@gls-douane.com"
ADMIN_PASSWORD = "GlsAdmin2019!"


# ---------- Fixtures ----------
@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api_client):
    r = api_client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    return data["access_token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ---------- Auth ----------
class TestAuth:
    def test_login_success(self, api_client):
        r = api_client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data.get("access_token"), str) and len(data["access_token"]) > 20
        assert data["user"]["email"] == ADMIN_EMAIL
        assert "id" in data["user"]

    def test_login_wrong_password(self, api_client):
        r = api_client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-pwd"})
        assert r.status_code == 401

    def test_login_unknown_user(self, api_client):
        r = api_client.post(f"{API}/auth/login", json={"email": "nobody@gls-douane.com", "password": "x"})
        assert r.status_code == 401

    def test_me_with_token(self, api_client, auth_headers):
        r = api_client.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert "id" in data

    def test_me_without_token(self, api_client):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401


# ---------- Contact create (public) ----------
class TestContactCreate:
    def test_create_contact_message(self, api_client):
        payload = {
            "name": "TEST_Pytest User",
            "email": "TEST_pytest@example.com",
            "phone": "+243000000000",
            "company": "TEST Co",
            "subject": "TEST subject",
            "message": "TEST body message from pytest",
        }
        r = api_client.post(f"{API}/contact", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        assert "id" in data and len(data["id"]) > 5

    def test_create_contact_missing_required(self, api_client):
        r = api_client.post(f"{API}/contact", json={"email": "x@y.com"})
        assert r.status_code in (400, 422)

    def test_create_contact_bad_email(self, api_client):
        r = api_client.post(f"{API}/contact", json={"name": "x", "email": "not-an-email", "message": "hi"})
        assert r.status_code in (400, 422)


# ---------- Admin message management ----------
class TestContactAdmin:
    def test_messages_requires_auth(self, api_client):
        r = requests.get(f"{API}/contact/messages")
        assert r.status_code == 401

    def test_stats_requires_auth(self, api_client):
        r = requests.get(f"{API}/contact/stats")
        assert r.status_code == 401

    def test_create_then_list_then_mark_read_then_delete(self, api_client, auth_headers):
        # Stats before
        r = api_client.get(f"{API}/contact/stats", headers=auth_headers)
        assert r.status_code == 200
        before = r.json()
        assert "total" in before and "unread" in before

        # Create
        payload = {
            "name": "TEST_Flow",
            "email": "TEST_flow@example.com",
            "phone": "",
            "company": "",
            "subject": "TEST flow subject",
            "message": "TEST flow message",
        }
        r = api_client.post(f"{API}/contact", json=payload)
        assert r.status_code == 200
        msg_id = r.json()["id"]

        # Stats after create — total and unread should increase
        r = api_client.get(f"{API}/contact/stats", headers=auth_headers)
        assert r.status_code == 200
        after_create = r.json()
        assert after_create["total"] == before["total"] + 1
        assert after_create["unread"] == before["unread"] + 1

        # List - should include the new message
        r = api_client.get(f"{API}/contact/messages", headers=auth_headers)
        assert r.status_code == 200
        msgs = r.json()
        assert isinstance(msgs, list)
        found = next((m for m in msgs if m["id"] == msg_id), None)
        assert found is not None
        assert found["email"] == "TEST_flow@example.com"
        assert found["read"] is False
        assert found["subject"] == "TEST flow subject"

        # Mark read
        r = api_client.patch(f"{API}/contact/messages/{msg_id}/read", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["success"] is True

        # Stats - unread should drop by 1, total unchanged
        r = api_client.get(f"{API}/contact/stats", headers=auth_headers)
        assert r.status_code == 200
        after_read = r.json()
        assert after_read["total"] == after_create["total"]
        assert after_read["unread"] == after_create["unread"] - 1

        # Verify read=True in list
        r = api_client.get(f"{API}/contact/messages", headers=auth_headers)
        found = next((m for m in r.json() if m["id"] == msg_id), None)
        assert found is not None and found["read"] is True

        # Delete
        r = api_client.delete(f"{API}/contact/messages/{msg_id}", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["success"] is True

        # Verify removed
        r = api_client.get(f"{API}/contact/messages", headers=auth_headers)
        assert all(m["id"] != msg_id for m in r.json())

        # Stats - total back to before, unread back to before
        r = api_client.get(f"{API}/contact/stats", headers=auth_headers)
        after_delete = r.json()
        assert after_delete["total"] == before["total"]
        assert after_delete["unread"] == before["unread"]
