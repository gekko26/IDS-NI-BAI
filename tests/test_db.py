"""Unit tests for app.db. Uses IDSLAB_DB to point at a throwaway file so
the development database is never touched:
    Backend/.venv/bin/python -m unittest discover -s tests -t .
"""
import os
import sqlite3
import tempfile
import unittest
from importlib import reload


class DbTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        handle, path = tempfile.mkstemp(suffix=".db")
        os.close(handle)
        cls.path = path
        os.environ["IDSLAB_DB"] = path
        import app.db as db_module

        cls.db = reload(db_module)

    @classmethod
    def tearDownClass(cls):
        for suffix in ("", "-wal", "-shm"):
            try:
                os.unlink(cls.path + suffix)
            except FileNotFoundError:
                pass
        del os.environ["IDSLAB_DB"]

    def test_idslab_db_override_is_used(self):
        self.assertEqual(str(self.db.DB_PATH), self.path)

    def test_init_creates_expected_tables(self):
        self.db.init_db()
        conn = sqlite3.connect(self.db.DB_PATH)
        try:
            names = {
                row[0]
                for row in conn.execute(
                    "SELECT name FROM sqlite_master WHERE type = 'table'"
                )
            }
        finally:
            conn.close()
        self.assertLessEqual(
            {"telemetry", "users", "sessions", "detections"}, names
        )

    def test_connection_is_wal_with_busy_timeout(self):
        self.db.init_db()
        conn = self.db.get_connection()
        try:
            self.assertEqual(
                conn.execute("PRAGMA journal_mode").fetchone()[0].lower(), "wal"
            )
            self.assertEqual(
                conn.execute("PRAGMA busy_timeout").fetchone()[0], 5000
            )
        finally:
            conn.close()

    def test_session_ttl_is_7_days(self):
        self.assertEqual(self.db.SESSION_TTL_DAYS, 7)


if __name__ == "__main__":
    unittest.main()
