import os
import sys

# Ensure root directory is on Python path so backend modules can be imported
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.main import app as fastapi_app

async def app(scope, receive, send):
    if scope["type"] == "http":
        path = scope.get("path", "")
        # Restore /api prefix if Vercel stripped it
        if path and not path.startswith("/api"):
            scope["path"] = f"/api{path}"
    await fastapi_app(scope, receive, send)
