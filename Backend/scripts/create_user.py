"""Create or update a dashboard user (password stored hashed).

Usage (run from Backend/ with the venv python):
    .venv/bin/python -m scripts.create_user <username> [password]

If the password argument is omitted it is prompted for (hidden). The
plaintext never touches the database or the repository.
"""
import getpass
import sys

from app.db import get_connection, init_db
from app.security import hash_password


def main() -> None:
    if len(sys.argv) < 2 or len(sys.argv) > 3:
        sys.exit(__doc__)
    username = sys.argv[1]
    if not username or "/" in username or username.strip() != username:
        sys.exit("invalid username")
    password = sys.argv[2] if len(sys.argv) == 3 else getpass.getpass(
        f"password for {username}: "
    )
    if len(password) < 8:
        sys.exit("password must be at least 8 characters")

    init_db()
    conn = get_connection()
    try:
        conn.execute(
            "INSERT INTO users (username, password_hash) VALUES (?, ?) "
            "ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash",
            (username, hash_password(password)),
        )
        conn.commit()
        count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    finally:
        conn.close()
    print(f"user '{username}' stored (hashed); users table now has {count} row(s)")


if __name__ == "__main__":
    main()
