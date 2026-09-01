"""Tests for new features: change-password, dossier client_phone, track privacy."""
import os
import re
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@gls-douane.com"
ADMIN_PASSWORD = "GlsAdmin2019!"


def _xff():
    # unique XFF per test to isolate rate limiter buckets
    return f"10.42.{uuid.uuid4().int % 250}.{uuid.uuid4().int % 250}"


def _login(password=ADMIN_PASSWORD, xff=None):
    headers = {"X-Forwarded-For": xff or _xff()}
    return requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": password}, headers=headers)


@pytest.fixture(scope="module")
def token():
    r = _login()
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------- Dossier client_phone + privacy on /track ----------
class TestDossierPhonePrivacy:
    def test_create_dossier_with_phone(self, auth_headers):
        payload = {
            "client_name": "TEST_PhoneClient",
            "client_phone": "+243 970 123 456",
            "origin": "Durban",
            "destination": "Lubumbashi",
        }
        r = requests.post(f"{API}/dossiers", json=payload, headers=auth_headers)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["client_phone"] == "+243 970 123 456"
        # GET list also returns client_phone
        r2 = requests.get(f"{API}/dossiers", headers=auth_headers)
        row = next((x for x in r2.json() if x["id"] == d["id"]), None)
        assert row is not None and row["client_phone"] == "+243 970 123 456"

        # /api/track must NOT include client_phone
        xff = {"X-Forwarded-For": _xff()}
        rt = requests.get(f"{API}/track/{d['reference']}", headers=xff)
        assert rt.status_code == 200
        body = rt.json()
        assert "client_phone" not in body, f"client_phone leaked in /track response: {body}"
        assert "id" not in body

        # cleanup
        requests.delete(f"{API}/dossiers/{d['id']}", headers=auth_headers)

    def test_create_dossier_without_phone(self, auth_headers):
        payload = {"client_name": "TEST_NoPhone", "origin": "X", "destination": "Y"}
        r = requests.post(f"{API}/dossiers", json=payload, headers=auth_headers)
        assert r.status_code == 200
        d = r.json()
        assert d["client_phone"] == ""
        requests.delete(f"{API}/dossiers/{d['id']}", headers=auth_headers)


# ---------- Change password ----------
NEW_PWD = "TempChg123!"


class TestChangePassword:
    def test_requires_auth(self):
        r = requests.post(f"{API}/auth/change-password", json={"current_password": "x", "new_password": "yyyyyyyy"})
        assert r.status_code == 401

    def test_wrong_current_password(self, auth_headers):
        r = requests.post(
            f"{API}/auth/change-password",
            json={"current_password": "WRONG_CURRENT", "new_password": "somevalid123"},
            headers={**auth_headers, "X-Forwarded-For": _xff()},
        )
        assert r.status_code == 401
        assert "actuel" in r.json().get("detail", "").lower()

    def test_new_password_too_short(self, auth_headers):
        r = requests.post(
            f"{API}/auth/change-password",
            json={"current_password": ADMIN_PASSWORD, "new_password": "short"},
            headers={**auth_headers, "X-Forwarded-For": _xff()},
        )
        assert r.status_code == 422

    def test_full_change_flow_and_restore(self, auth_headers):
        """Change to NEW_PWD, verify login works with new, then restore to original."""
        xff1 = _xff()
        # 1. change to NEW_PWD
        r = requests.post(
            f"{API}/auth/change-password",
            json={"current_password": ADMIN_PASSWORD, "new_password": NEW_PWD},
            headers={**auth_headers, "X-Forwarded-For": xff1},
        )
        assert r.status_code == 200, r.text
        assert r.json().get("success") is True

        # 2. login with new password works
        r2 = _login(password=NEW_PWD, xff=_xff())
        assert r2.status_code == 200, f"Login with new password failed: {r2.text}"
        new_token = r2.json()["access_token"]

        # 3. login with old password fails
        r3 = _login(password=ADMIN_PASSWORD, xff=_xff())
        assert r3.status_code == 401

        # 4. restore original password
        r4 = requests.post(
            f"{API}/auth/change-password",
            json={"current_password": NEW_PWD, "new_password": ADMIN_PASSWORD},
            headers={"Authorization": f"Bearer {new_token}", "Content-Type": "application/json",
                     "X-Forwarded-For": _xff()},
        )
        assert r4.status_code == 200, f"Restore failed: {r4.text}"

        # 5. verify original credentials work again
        r5 = _login(password=ADMIN_PASSWORD, xff=_xff())
        assert r5.status_code == 200, "Original password not restored!"


# ---------- Demo dossier retained ----------
class TestDemoDossierRetained:
    def test_demo_dossier_present(self):
        r = requests.get(f"{API}/track/GLS-2026-RIAYO3J8", headers={"X-Forwarded-For": _xff()})
        assert r.status_code == 200
        d = r.json()
        assert d["reference"] == "GLS-2026-RIAYO3J8"
        assert "client_phone" not in d
