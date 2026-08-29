"""
Vercel Python Serverless Function entry point.
Imports the FastAPI app from the backend package.
"""
import sys
import os

# Add backend directory to Python path so 'app' package is discoverable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app  # noqa: F401
