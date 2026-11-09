# Backend

Python side of the IDS: FastAPI backend plus the capture, feature-extraction
and inference services.

## Virtual environment

The backend uses a Python venv stored in `.venv/` (gitignored).

```bash
python -m venv .venv
source .venv/bin/activate   # leave it again with: deactivate
```

Once dependencies are decided they will be listed in `requirements.txt`,
installed inside this venv, never into the system Python.
