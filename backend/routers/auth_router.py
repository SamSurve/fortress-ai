from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from auth import verify_password, hash_password, create_access_token, get_current_user
from services.audit_service import log_audit_event

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=schemas.TokenResponse)
def login(login_data: schemas.LoginRequest, request: Request, db: Session = Depends(get_db)):
    """Authenticate user with email and password, returning JWT token and user profile."""
    user = db.query(models.User).filter(models.User.email == login_data.email.strip().lower()).first()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        log_audit_event(
            db=db,
            user_id=user.id if user else None,
            user_email=login_data.email,
            action="LOGIN_FAILED",
            resource="auth",
            metadata={"reason": "Invalid credentials"},
            ip_address=request.client.host if request.client else "127.0.0.1"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated. Contact system administrator."
        )

    token = create_access_token(data={
        "user_id": user.id,
        "email": user.email,
        "role": user.role
    })

    log_audit_event(
        db=db,
        user_id=user.id,
        user_email=user.email,
        action="LOGIN_SUCCESS",
        resource="auth",
        metadata={"role": user.role},
        ip_address=request.client.host if request.client else "127.0.0.1"
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/signup", response_model=schemas.TokenResponse)
def signup(signup_data: schemas.SignupRequest, request: Request, db: Session = Depends(get_db)):
    """Register a new user account (defaults to EMPLOYEE role)."""
    email_clean = signup_data.email.strip().lower()
    existing = db.query(models.User).filter(models.User.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )

    new_user = models.User(
        name=signup_data.name.strip(),
        email=email_clean,
        password_hash=hash_password(signup_data.password),
        role="EMPLOYEE",
        can_upload=False,
        can_access_ai=True,
        status="active"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={
        "user_id": new_user.id,
        "email": new_user.email,
        "role": new_user.role
    })

    log_audit_event(
        db=db,
        user_id=new_user.id,
        user_email=new_user.email,
        action="SIGNUP",
        resource="auth",
        metadata={"role": new_user.role},
        ip_address=request.client.host if request.client else "127.0.0.1"
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/logout")
def logout(request: Request, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Logout current user and log audit event."""
    log_audit_event(
        db=db,
        user_id=current_user.id,
        user_email=current_user.email,
        action="LOGOUT",
        resource="auth",
        metadata={"role": current_user.role},
        ip_address=request.client.host if request.client else "127.0.0.1"
    )
    return {"message": "Successfully logged out."}

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    """Get current authenticated user profile."""
    return current_user
