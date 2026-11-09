"""Password hashing and session tokens — stdlib only.

Passwords use PBKDF2-HMAC-SHA256 (600k iterations, per OWASP's 2023
guidance), stored as ``pbkdf2_sha256$<iterations>$<hex salt>$<hex digest>``.
Session tokens are 64-hex random values stored in the sessions table.
"""
import hashlib
import hmac
import secrets

PBKDF2_ITERATIONS = 600_000
_ALGO = "pbkdf2_sha256"

# Constant-dummy hash used to equalise timing when an unknown username is
# given (same work as a real verify), against username enumeration timing.
_DUMMY_HASH = None


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), bytes.fromhex(salt),
        PBKDF2_ITERATIONS,
    )
    return f"{_ALGO}${PBKDF2_ITERATIONS}${salt}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algo, iterations, salt, digest_hex = stored.split("$", 3)
        if algo != _ALGO:
            return False
        digest = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), bytes.fromhex(salt),
            int(iterations),
        )
        return hmac.compare_digest(digest.hex(), digest_hex)
    except (ValueError, TypeError):
        return False


def dummy_verify(password: str) -> None:
    """Burn a verify's worth of time for unknown usernames."""
    global _DUMMY_HASH
    if _DUMMY_HASH is None:
        _DUMMY_HASH = hash_password("timing-equaliser-only")
    verify_password(password, _DUMMY_HASH)


def new_token() -> str:
    return secrets.token_hex(32)
