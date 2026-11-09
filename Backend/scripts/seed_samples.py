"""Seed clearly-labelled sample detections so the dashboard has data.

Run from Backend/:  .venv/bin/python -m scripts.seed_samples

Rows are tagged source='sample' — they never represent real captures.
"""
import random
from datetime import datetime, timedelta, timezone

from app.db import get_connection, init_db

CLASSES = "benign dos scan brute_force arp_spoof".split()

SAMPLES = [
    # (minutes_ago, cls, confidence)
    (9, "benign", 0.98),
    (8, "benign", 0.97),
    (7, "dos", 0.96),
    (7, "dos", 0.97),
    (6, "scan", 0.91),
    (5, "benign", 0.98),
    (4, "brute_force", 0.94),
    (3, "benign", 0.99),
    (2, "arp_spoof", 0.89),
    (1, "benign", 0.98),
]


def main() -> None:
    init_db()
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT COUNT(*) FROM detections WHERE source = 'sample'"
        ).fetchone()[0]
        if existing:
            print(f"{existing} sample row(s) already present; nothing seeded")
            return
        now = datetime.now(timezone.utc)
        for minutes_ago, cls, confidence in SAMPLES:
            ts = now - timedelta(minutes=minutes_ago)
            ts_str = ts.strftime("%Y-%m-%dT%H:%M:%SZ")
            start = (ts - timedelta(seconds=2)).strftime("%Y-%m-%dT%H:%M:%SZ")
            conn.execute(
                "INSERT INTO detections (ts, source, window_start, "
                "window_end, predicted_class, confidence, latency_ms, run_id) "
                "VALUES (?, 'sample', ?, ?, ?, ?, ?, ?)",
                (
                    ts_str,
                    start,
                    ts_str,
                    cls,
                    round(confidence + random.uniform(-0.01, 0.01), 3),
                    round(random.uniform(4, 12), 1),
                    "dev-seed",
                ),
            )
        conn.commit()
        total = conn.execute("SELECT COUNT(*) FROM detections").fetchone()[0]
    finally:
        conn.close()
    print(f"seeded {len(SAMPLES)} sample detections (detections total: {total})")


if __name__ == "__main__":
    main()
