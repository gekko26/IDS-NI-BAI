"""Unit tests for app.security (run from the repo root with the venv):
    Backend/.venv/bin/python -m unittest discover -s tests -t .
"""
import unittest

from app.security import PBKDF2_ITERATIONS, hash_password, new_token, verify_password


class SecurityTests(unittest.TestCase):
    def test_roundtrip(self):
        stored = hash_password("hunter2")
        self.assertTrue(stored.startswith(f"pbkdf2_sha256${PBKDF2_ITERATIONS}$"))
        self.assertTrue(verify_password("hunter2", stored))

    def test_wrong_password_fails(self):
        stored = hash_password("hunter2")
        self.assertFalse(verify_password("hunter3", stored))

    def test_salt_is_unique_per_hash(self):
        self.assertNotEqual(hash_password("same"), hash_password("same"))

    def test_malformed_stored_hash_fails_closed(self):
        self.assertFalse(verify_password("x", "not-a-hash"))
        self.assertFalse(verify_password("x", "pbkdf2_sha256$abc$deadbeef"))
        self.assertFalse(verify_password("x", "md5$1$salt$abc"))

    def test_token_shape_and_uniqueness(self):
        token = new_token()
        self.assertEqual(len(token), 64)
        self.assertTrue(all(c in "0123456789abcdef" for c in token))
        self.assertNotEqual(token, new_token())


if __name__ == "__main__":
    unittest.main()
