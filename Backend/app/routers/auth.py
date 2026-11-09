"""Authentication endpoints: login, session check, logout.

A login issues a random 64-hex session token stored in the sessions table
(7-day TTL, per app.db.SESSION_TTL_DAYS). Clients send it as
``Authorization: Bearer <token>``.
"""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel

from ..db import SESSION_TTL_DAYS, get_connection
from ..security import dummy_verify, new_token, verify_password

router = APIRouter(prefix="/api")


class LoginRequest(BaseModel):
    username: str
    password: str


def _bearer_token(authorization: str | None) -> str | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    return authorization[len("Bearer "):].strip()


def current_user(
    authorization: str | None = Header(default=None),
) -> str:
    """Dependency: returns the username for a valid session token."""
    token = _bearer_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT s.token, s.expires_at, s.user_id, u.username "
            "FROM sessions s JOIN users u ON u.id = s.user_id "
            "WHERE s.token = ?",
            (token,),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=401, detail="Not authenticated")
        expires = datetime.fromisoformat(row["expires_at"])
        now = datetime.now(timezone.utc)
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if now >= expires:
            conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
            conn.commit()
            raise HTTPException(status_code=401, detail="Session expired")
        return row["username"]
    finally:
        conn.close()


@router.post("/login")
def login(body: LoginRequest):
    conn = get_connection()
    try:
        user = conn.execute(
            "SELECT id, username, password_hash FROM users WHERE username = ?",
            (body.username,),
        ).fetchone()
        stored = user["password_hash"] if user is not None else None
        ok = verify_password(body.password, stored) if stored else False
        if not ok:
            if stored is None:
                dummy_verify(body.password)
            raise HTTPException(
                status_code=401, detail="Invalid username or password"
            )
        token = new_token()
        expires = datetime.now(timezone.utc) + timedelta(days=SESSION_TTL_DAYS)
        conn.execute(
            "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
            (token, user["id"], expires.isoformat()),
        )
        conn.commit()
        return {"token": token, "username": user["username"]}
    finally:
        conn.close()


@router.get("/me")
def me(username: str = Depends(current_user)):
    return {"username": username}


@router.post("/logout")
def logout(
    authorization: str | None = Header(default=None),
    _: str = Depends(current_user),
):
    token = _bearer_token(authorization)
    conn = get_connection()
    try:
        conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
        conn.commit()
    finally:
        conn.close()
    return {"ok": True}
