import json
from typing import Optional, Any
from sqlalchemy.orm import Session
import models

def log_audit_event(
    db: Session,
    user_id: Optional[int],
    user_email: str,
    action: str,
    resource: Optional[str] = None,
    metadata: Optional[Any] = None,
    ip_address: str = "127.0.0.1"
) -> models.AuditLog:
    """Record an audit trail event in the database."""
    metadata_str = None
    if metadata is not None:
        if isinstance(metadata, str):
            metadata_str = metadata
        else:
            try:
                metadata_str = json.dumps(metadata)
            except Exception:
                metadata_str = str(metadata)

    log_entry = models.AuditLog(
        user_id=user_id,
        user_email=user_email,
        action=action,
        resource=resource,
        metadata_json=metadata_str,
        ip_address=ip_address
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
