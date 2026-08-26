"""
PathFinder Backend — Entry Point
Re-exports the FastAPI app from the modular app package.
This file is kept for backward compatibility with api/index.py import.
"""
from backend.app.main import app  # noqa: F401

__all__ = ["app"]
