from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from auth import require_admin, hash_password
from services.audit_service import log_audit_event

router = APIRouter(prefix="/users", tags=["User Management"])

@router.get("", response_model=List[schemas.UserResponse])
def list_users(
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Retrieve all users in the organization (Admin only)."""
    return db.query(models.User).order_by(models.User.id.asc()).all()

@router.post("", response_model=schemas.UserResponse)
def create_user(
    user_data: schemas.UserCreate,
    request: Request,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new user account (Admin only)."""
    email_clean = user_data.email.strip().lower()
    existing = db.query(models.User).filter(models.User.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    user = models.User(
        name=user_data.name.strip(),
        email=email_clean,
        password_hash=hash_password(user_data.password),
        role=user_data.role.upper(),
        can_upload=user_data.can_upload,
        can_access_ai=user_data.can_access_ai,
        status=user_data.status
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log_audit_event(
        db=db,
        user_id=current_user.id,
        user_email=current_user.email,
        action="USER_CREATE",
        resource=f"user:{user.id}",
        metadata={"created_email": user.email, "role": user.role},
        ip_address=request.client.host if request.client else "127.0.0.1"
    )

    return user

@router.patch("/{user_id}/permissions", response_model=schemas.UserResponse)
def update_user_permissions(
    user_id: int,
    perms: schemas.PermissionUpdateRequest,
    request: Request,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update permissions, status, or role for a specific user (Admin only)."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # Prevent admin from locking themselves out
    if user.id == current_user.id:
        if perms.status == "disabled":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Administrators cannot deactivate their own account."
            )
        if perms.role and perms.role.upper() != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Administrators cannot demote themselves."
            )

    changed_fields = {}
    if perms.can_upload is not None:
        user.can_upload = perms.can_upload
        changed_fields["can_upload"] = perms.can_upload
    if perms.can_access_ai is not None:
        user.can_access_ai = perms.can_access_ai
        changed_fields["can_access_ai"] = perms.can_access_ai
    if perms.status is not None:
        user.status = perms.status
        changed_fields["status"] = perms.status
    if perms.role is not None:
        user.role = perms.role.upper()
        changed_fields["role"] = perms.role.upper()

    db.commit()
    db.refresh(user)

    log_audit_event(
        db=db,
        user_id=current_user.id,
        user_email=current_user.email,
        action="PERMISSION_CHANGE",
        resource=f"user:{user.id}",
        metadata={"target_user": user.email, "changes": changed_fields},
        ip_address=request.client.host if request.client else "127.0.0.1"
    )

    return user
