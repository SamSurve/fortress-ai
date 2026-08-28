import os
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
import models
import schemas
from auth import require_admin
from services.document_service import format_file_size, get_active_document

router = APIRouter(tags=["Audit & Analytics"])

@router.get("/audit-logs", response_model=List[schemas.AuditLogResponse])
def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    action: Optional[str] = None,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Retrieve system audit logs (Admin only)."""
    query = db.query(models.AuditLog)
    if action:
        query = query.filter(models.AuditLog.action == action.upper())
    
    logs = query.order_by(models.AuditLog.id.desc()).offset(offset).limit(limit).all()
    return logs

@router.get("/dashboard/stats", response_model=schemas.DashboardStatsResponse)
def get_dashboard_stats(
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Retrieve overview metrics for Admin Dashboard (Admin only)."""
    total_docs = db.query(models.Document).count()
    total_users = db.query(models.User).count()

    today_start = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    ai_queries_today = db.query(models.ChatMessage).filter(
        models.ChatMessage.role == "user",
        models.ChatMessage.created_at >= today_start
    ).count()

    total_storage = db.query(func.sum(models.Document.file_size)).scalar() or 0

    active_doc = get_active_document(db)
    active_doc_resp = None
    if active_doc:
        active_doc_resp = schemas.DocumentResponse.from_orm(active_doc)
        if active_doc.uploader:
            active_doc_resp.uploader_name = active_doc.uploader.name

    recent_docs = db.query(models.Document).order_by(models.Document.id.desc()).limit(5).all()
    recent_docs_resp = []
    for d in recent_docs:
        d_resp = schemas.DocumentResponse.from_orm(d)
        if d.uploader:
            d_resp.uploader_name = d.uploader.name
        recent_docs_resp.append(d_resp)

    recent_audit = db.query(models.AuditLog).order_by(models.AuditLog.id.desc()).limit(8).all()

    return schemas.DashboardStatsResponse(
        total_documents=total_docs,
        total_users=total_users,
        ai_queries_today=ai_queries_today,
        storage_used_bytes=total_storage,
        storage_used_formatted=format_file_size(total_storage),
        active_document=active_doc_resp,
        recent_documents=recent_docs_resp,
        recent_activity=recent_audit
    )
