"""SQLite access for the IDS dashboard backend.

SQLite in WAL mode stores ML detections, Snort alerts, telemetry, network
statistics and historical logs. Kept deliberately small for now: only the
telemetry table exists until the detection schema is finalised.
"""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "app.db"


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
            """
        )
        conn.commit()
    finally:
        conn.close()
