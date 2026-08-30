"""Login brute-force lockout test — MUST RUN LAST.

After 5 failed logins, the 6th returns 429 and the IP is locked for 15 min
(in-memory sliding window). We restart backend at the end to clear state.
"""
import os
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_EMAIL = "admin@gls-douane.com"
ADMIN_PASSWORD = "GlsAdmin2019!"


def test_zzz_brute_force_lockout():
    # Isolate to a unique IP so we don't lock out the real testing IP.
    headers = {"X-Forwarded-For": "10.99.88.55"}
    statuses = []
    for i in range(6):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": f"wrong-{i}"}, headers=headers)
        statuses.append(r.status_code)
    assert statuses[:5].count(401) == 5, f"Expected 5x 401, got {statuses}"
    assert statuses[5] == 429, f"Expected 429 on 6th, got {statuses}"
    # Even correct credentials should now be 429 from that IP
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, headers=headers)
    assert r.status_code == 429, f"Expected 429 after lockout w/ correct creds, got {r.status_code}"
    body = r.json().get("detail", "").lower()
    assert "verrouill" in body or "tentatives" in body, f"Missing French lockout msg: {body}"
