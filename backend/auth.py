import hashlib
import os
import hmac
import base64
import json
import time
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from config import settings
from database import get_db
import models
import schemas

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

# ----------------- PASSWORD HASHING (PBKDF2-HMAC-SHA256) -----------------
def hash_password(password: str) -> str:
    """Generate secure salted PBKDF2 hash for password."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        100000
    )
    salt_b64 = base64.b64encode(salt).decode('ascii')
    key_b64 = base64.b64encode(key).decode('ascii')
    return f"pbkdf2_sha256$100000${salt_b64}${key_b64}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password."""
    if not hashed_password:
        return False
    try:
        if hashed_password.startswith("pbkdf2_sha256$"):
            parts = hashed_password.split("$")
            if len(parts) != 4:
                return False
            iterations = int(parts[1])
            salt = base64.b64decode(parts[2].encode('ascii'))
            stored_key = base64.b64decode(parts[3].encode('ascii'))
            new_key = hashlib.pbkdf2_hmac(
                'sha256',
                plain_password.encode('utf-8'),
                salt,
                iterations
            )
            return hmac.compare_digest(stored_key, new_key)
        # Fallback for plain demo comparison if ever seeded as plain in dev
        return hmac.compare_digest(plain_password, hashed_password)
    except Exception:
        return False

# ----------------- JWT TOKEN GENERATION & DECODING -----------------
def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('ascii')

def _base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generate signed JWT token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    header = {"alg": settings.JWT_ALGORITHM, "typ": "JWT"}
    payload = {
        **to_encode,
        "exp": int(expire.timestamp()),
        "iat": int(datetime.utcnow().timestamp())
    }

    header_b64 = _base64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    payload_b64 = _base64url_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))
    
    signing_input = f"{header_b64}.{payload_b64}".encode('ascii')
    signature = hmac.new(settings.JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()
    sig_b64 = _base64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{sig_b64}"

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify signed JWT token."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        
        signing_input = f"{header_b64}.{payload_b64}".encode('ascii')
        expected_sig = hmac.new(settings.JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()
        provided_sig = _base64url_decode(sig_b64)

        if not hmac.compare_digest(expected_sig, provided_sig):
            return None

        payload = json.loads(_base64url_decode(payload_b64).decode('utf-8'))
        
        # Check expiration
        if "exp" in payload and payload["exp"] < int(datetime.utcnow().timestamp()):
            return None

        return payload
    except Exception:
        return None

# ----------------- FASTAPI AUTH DEPENDENCIES -----------------
def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    """Dependency to retrieve and validate the currently authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id = payload.get("user_id")
    if user_id is None:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None or user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive or deleted"
        )
    return user

def require_admin(current_user: models.User = Depends(get_current_user)) -> models.User:
    """Ensure that the authenticated user possesses the ADMIN role."""
    if current_user.role.upper() != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Administrator privileges required."
        )
    return current_user

def require_ai_access(current_user: models.User = Depends(get_current_user)) -> models.User:
    """Ensure that the user has AI Workspace access enabled."""
    if not current_user.can_access_ai:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI Assistant access has been disabled for your account by an administrator."
        )
    return current_user

def require_upload_access(current_user: models.User = Depends(get_current_user)) -> models.User:
    """Ensure that the user is permitted to upload documents."""
    if current_user.role.upper() != "ADMIN" and not current_user.can_upload:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Document upload permission is restricted to administrators and authorized uploaders."
        )
    return current_user
