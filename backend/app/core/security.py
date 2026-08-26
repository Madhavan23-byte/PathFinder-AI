"""
PathFinder Backend — Security Utilities
Handles password hashing, JWT creation, token decoding, and auth dependency.
"""
import time
import bcrypt
import jwt
from typing import Dict, Any, Optional
from fastapi import HTTPException, Header, status

from backend.app.core.config import JWT_SECRET, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_jwt_token(user_id: str, email: str) -> str:
    """Create a signed JWT token for the given user."""
    payload = {
        "sub": user_id,
        "email": email,
        "iat": int(time.time()),
        "exp": int(time.time()) + (ACCESS_TOKEN_EXPIRE_MINUTES * 60 * 24 * 7),  # 7 days
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_jwt_token(token: str) -> Dict[str, Any]:
    """Decode and validate a JWT token. Raises HTTPException on failure."""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again."
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token."
        )


def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """FastAPI dependency — extracts and validates the Bearer token from headers."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header."
        )
    token = authorization.split(" ")[1]
    payload = decode_jwt_token(token)
    return payload["sub"]


def sanitize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert MongoDB ObjectId _id to string for JSON serialization."""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc
