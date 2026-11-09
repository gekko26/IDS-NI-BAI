"""SQLite access for the IDS dashboard backend.

SQLite in WAL mode stores ML detections, Snort alerts, telemetry, network
statistics and historical logs, plus the small auth tables (users,
sessions). The file lives under Backend/data/ by default and can be
redirected for tests with the IDSLAB_DB environment variable.
"""
import os
import sqlite3
from pathlib import Path

_DEFAULT_DB = Path(__file__).resolve().parent.parent / "data" / "app.db"
DB_PATH = Path(os.environ.get("IDSLAB_DB", str(_DEFAULT_DB)))

SESSION_TTL_DAYS = 7


def get_connection() -> sqlite3.Connection:
    """Open a connection with WAL enabled and a short busy timeout."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=5.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=5000")
    return conn


def init_db() -> None:
    """Create the tables that currently exist."""
    conn = get_connection()
    try:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS telemetry (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ts TEXT NOT NULL DEFAULT (
                    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                ),
                source TEXT NOT NULL DEFAULT 'test',
                cpu_pct REAL,
                mem_pct REAL,
                pkt_count INTEGER
            );

            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (
                    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                )
            );

            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                created_at TEXT NOT NULL DEFAULT (
                    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                ),
                expires_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS detections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ts TEXT NOT NULL DEFAULT (
                    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                ),
                source TEXT NOT NULL DEFAULT 'pipeline',
                window_start TEXT,
                window_end TEXT,
                predicted_class TEXT NOT NULL,
                confidence REAL NOT NULL,
                latency_ms REAL,
                features_json TEXT NOT NULL DEFAULT '{}',
                run_id TEXT
            );
            CREATE INDEX IF NOT EXISTS idx_detections_ts
                ON detections (ts DESC);
            """
        )
        conn.commit()
    finally:
        conn.close()
