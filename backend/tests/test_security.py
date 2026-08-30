"""Security hardening tests for GLS backend.

Covers: 8-char reference, /api/track rate limit (15/min), invalid ObjectId -> 404,
input length caps, contact rate limit, invalid dossier status.
NOTE: login brute-force test is deliberately in a SEPARATE file (test_zzz_brute.py)
so it runs LAST — it locks the IP for 15 minutes.
"""
import os
import re
import time
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_EMAIL = "admin@gls-douane.com"
ADMIN_PASSWORD = "GlsAdmin2019!"

REF_RE = re.compile(r"^GLS-\d{4}-[A-Z0-9]{8}$")


@pytest.fixture(scope="module")
def auth_headers():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}", "Content-Type": "application/json"}


class TestReferenceHardening:
    def test_new_dossier_reference_is_8_chars(self, auth_headers):
        r = requests.post(f"{API}/dossiers", json={"client_name": "TEST_SecRef"}, headers=auth_headers)
        assert r.status_code == 200, r.text
        d = r.json()
        assert REF_RE.match(d["reference"]), f"Expected 8-char high-entropy ref, got {d['reference']}"
        # cleanup
        requests.delete(f"{API}/dossiers/{d['id']}", headers=auth_headers)

    def test_demo_dossier_still_exists(self):
        r = requests.get(f"{API}/track/GLS-2026-RIAYO3J8")
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["reference"] == "GLS-2026-RIAYO3J8"
        assert d["status"] == "declaration"
        assert "id" not in d


class TestInvalidObjectId:
    """All must return 404 (not 500) for a badly-formed ObjectId."""
    def test_delete_dossier_bad_id(self, auth_headers):
        r = requests.delete(f"{API}/dossiers/not-a-valid-id", headers=auth_headers)
        assert r.status_code == 404, f"{r.status_code} {r.text}"

    def test_patch_dossier_bad_id(self, auth_headers):
        r = requests.patch(f"{API}/dossiers/xx", json={"status": "livre"}, headers=auth_headers)
        assert r.status_code == 404, f"{r.status_code} {r.text}"

    def test_patch_message_read_bad_id(self, auth_headers):
        r = requests.patch(f"{API}/contact/messages/bad-id/read", headers=auth_headers)
        assert r.status_code == 404, f"{r.status_code} {r.text}"

    def test_delete_message_bad_id(self, auth_headers):
        r = requests.delete(f"{API}/contact/messages/bad-id", headers=auth_headers)
        assert r.status_code == 404, f"{r.status_code} {r.text}"


class TestInputCaps:
    def test_contact_message_over_5000_chars(self):
        payload = {
            "name": "TEST_Cap",
            "email": "TEST_cap@example.com",
            "message": "a" * 5001,
        }
        r = requests.post(f"{API}/contact", json=payload)
        assert r.status_code == 422, f"{r.status_code} {r.text}"

    def test_dossier_note_over_1000_chars(self, auth_headers):
        # create a dossier to update
        c = requests.post(f"{API}/dossiers", json={"client_name": "TEST_NoteCap"}, headers=auth_headers)
        assert c.status_code == 200
        did = c.json()["id"]
        try:
            r = requests.patch(
                f"{API}/dossiers/{did}",
                json={"status": "livre", "note": "x" * 1001},
                headers=auth_headers,
            )
            assert r.status_code == 422, f"{r.status_code} {r.text}"
        finally:
            requests.delete(f"{API}/dossiers/{did}", headers=auth_headers)


class TestInvalidStatus:
    def test_patch_invalid_status_returns_400(self, auth_headers):
        c = requests.post(f"{API}/dossiers", json={"client_name": "TEST_BadStatus"}, headers=auth_headers)
        assert c.status_code == 200
        did = c.json()["id"]
        try:
            r = requests.patch(
                f"{API}/dossiers/{did}",
                json={"status": "nope", "note": ""},
                headers=auth_headers,
            )
            assert r.status_code == 400, f"{r.status_code} {r.text}"
        finally:
            requests.delete(f"{API}/dossiers/{did}", headers=auth_headers)


# Rate-limit tests are placed AFTER the above (alphabetical class ordering)
# because they burn per-IP counters. We use unique refs so they can't collide.
class TestTrackRateLimit:
    def test_track_rate_limit_15_per_minute(self):
        # Fire 16 rapid requests to an unknown ref; 16th should be 429.
        # Use a unique X-Forwarded-For so we don't collide with other tests / real traffic.
        headers = {"X-Forwarded-For": "10.99.88.77"}
        statuses = []
        for i in range(16):
            r = requests.get(f"{API}/track/GLS-2026-NOPE0000", headers=headers)
            statuses.append(r.status_code)
        # First 15 should be 404 (unknown ref), 16th should be 429
        assert statuses[:15].count(404) == 15, f"Expected 15x 404, got {statuses}"
        assert statuses[15] == 429, f"Expected 429 on 16th, got {statuses}"
        # sliding window is 60s per-IP — sleep so subsequent test suites are safe
        # (nothing tracked after this test in the same run)


class TestContactRateLimit:
    def test_contact_rate_limit_5_per_5min(self):
        # 5 legitimate submissions then a 6th which should be 429.
        # Use a unique X-Forwarded-For to isolate the sliding-window counter.
        headers = {"X-Forwarded-For": "10.99.88.66"}
        payload = {
            "name": "TEST_RL",
            "email": "TEST_rl@example.com",
            "message": "rate limit test",
        }
        statuses = []
        for _ in range(6):
            r = requests.post(f"{API}/contact", json=payload, headers=headers)
            statuses.append(r.status_code)
        assert statuses[:5].count(200) == 5, f"Expected 5x 200, got {statuses}"
        assert statuses[5] == 429, f"Expected 429 on 6th, got {statuses}"
