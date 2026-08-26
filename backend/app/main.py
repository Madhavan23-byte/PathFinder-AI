"""
PathFinder Backend — FastAPI Application Factory
Assembles all routers and middleware into the final application instance.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import APP_TITLE, APP_DESCRIPTION, APP_VERSION
from backend.app.routers import auth, profile, dashboard, assessment, learning, misc

app = FastAPI(
    title=APP_TITLE,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
)

# CORS — allow all origins (tighten in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(dashboard.router)
app.include_router(assessment.router)
app.include_router(learning.router)
app.include_router(misc.router)
