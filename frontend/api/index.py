"""
Vercel Python Serverless Function entry point inside frontend folder.
Imports the FastAPI app from the backend package.
"""
import sys
import os

# Add backend directory to Python path so 'app' package is discoverable
# Path: frontend/api/index.py -> .. -> .. -> backend
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

from app.main import app  # noqa: F401
