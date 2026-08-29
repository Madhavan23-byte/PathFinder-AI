"""
Vercel Python Serverless Function entry point inside frontend folder.
Imports the FastAPI app from the local app package.
"""
from app.main import app  # noqa: F401
