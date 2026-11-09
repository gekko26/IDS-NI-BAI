"""Detection endpoints for the dashboard.

GET /api/detections returns recent rows plus a summary. Rows come from the
detections table (pipeline rows produced by the detector, or rows clearly
tagged source='sample' for development display).
"""
from fastapi import APIRouter, Depends

from ..db import get_connection
from .auth import current_user

router = APIRouter(prefix="/api")

MAX_LIMIT = 500


@router.get("/detections")
def detections(
    username: str = Depends(current_user),
    limit: int = 100,
    cls: str | None = None,
):
    limit = max(1, min(limit, MAX_LIMIT))
    conn = get_connection()
    try:
        params: list = []
        where = ""
        if cls:
            where = "WHERE predicted_class = ?"
            params.append(cls)
        rows = conn.execute(
            "SELECT id, ts, source, window_start, window_end, "
            "predicted_class, confidence, latency_ms, run_id "
            f"FROM detections {where} ORDER BY ts DESC LIMIT {limit}",
            params,
        ).fetchall()
        counts = conn.execute(
            "SELECT predicted_class, COUNT(*) AS n FROM detections GROUP BY 1"
        ).fetchall()
        last = conn.execute(
            "SELECT ts FROM detections ORDER BY ts DESC LIMIT 1"
        ).fetchone()
    finally:
        conn.close()

    by_class = {r["predicted_class"]: r["n"] for r in counts}
    total = sum(by_class.values())
    summary = {
        "total": total,
        "benign": by_class.get("benign", 0),
        "attacks": total - by_class.get("benign", 0),
        "by_class": by_class,
        "last_ts": last["ts"] if last else None,
    }
    return {"summary": summary, "items": [dict(r) for r in rows]}
