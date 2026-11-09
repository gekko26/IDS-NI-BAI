"""IDS dashboard backend (FastAPI).

Runs bound to 127.0.0.1 only; Nginx is the network-facing reverse proxy, as
per the deployment spec. Endpoints: health, a database smoke test, auth
(login/me/logout) and detections for the dashboard.
"""
import random
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI

from .db import DB_PATH, get_connection, init_db
from .routers import auth, detections


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="IDS Backend", version="0.2.0", lifespan=lifespan)

app.include_router(auth.router)
app.include_router(detections.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "time": datetime.now(timezone.utc).isoformat()}


@app.get("/api/db/status")
def db_status():
    """Insert one telemetry row and read it back — proves the DB works."""
    conn = get_connection()
    try:
        journal_mode = conn.execute("PRAGMA journal_mode").fetchone()[0]
        insert = conn.execute(
            "INSERT INTO telemetry (source, cpu_pct, mem_pct, pkt_count) "
            "VALUES ('test', ?, ?, ?)",
            (
                round(random.uniform(3, 15), 1),
                round(random.uniform(15, 40), 1),
                random.randint(0, 5000),
            ),
        )
        row = conn.execute(
            "SELECT id, ts, source, cpu_pct, mem_pct, pkt_count "
            "FROM telemetry ORDER BY id DESC LIMIT 1"
        ).fetchone()
        count = conn.execute("SELECT COUNT(*) FROM telemetry").fetchone()[0]
        conn.commit()
        return {
            "db_path": str(DB_PATH),
            "journal_mode": journal_mode,
            "rows_total": count,
            "last_row": {
                "id": row["id"],
                "ts": row["ts"],
                "source": row["source"],
                "cpu_pct": row["cpu_pct"],
                "mem_pct": row["mem_pct"],
                "pkt_count": row["pkt_count"],
            },
            "roundtrip_ok": row["id"] == insert.lastrowid,
        }
    finally:
        conn.close()
