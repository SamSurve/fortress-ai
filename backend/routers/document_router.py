import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from uuid import uuid4
from services.supabase_storage import upload_file_to_supabase
from auth import get_current_user, require_admin, require_upload_access
from services.audit_service import log_audit_event
from services.document_service import sanitize_filename, extract_pdf_page_count, get_active_document
from services.gemini_service import process_document_with_gemini

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload", response_model=schemas.DocumentResponse)
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    category: Optional[str] = Form("General"),
    current_user: models.User = Depends(require_upload_access),
    db: Session = Depends(get_db)
):
    """
    Upload and process a PDF document.
    Restricted to Admins and authorized uploaders.
    Persists file locally and processes with Gemini.
    """
    # Validate extension
    filename = sanitize_filename(file.filename)
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF documents are supported."
        )

    # Save to disk
    target_path = os.path.join(settings.UPLOADS_DIR, filename)
    file_bytes = await file.read()
    file_size = len(file_bytes)

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    if file_size > 50 * 1024 * 1024:  # 50MB limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File exceeds maximum allowable size (50MB)."
        )

    # Save to Supabase Storage
    # Generate a unique filename to avoid collisions
    unique_name = f"{uuid4().hex}_{filename}"
    # Upload the file bytes to Supabase
    supabase_path = upload_file_to_supabase(settings.SUPABASE_BUCKET, unique_name, file_bytes)
    # Use the Supabase path as the stored file_path
    target_path = supabase_path
    # Optionally, we could keep a local copy for immediate processing, but the helper will download as needed.
    # For processing metadata like page count, we need a local file. We'll download it temporarily via _ensure_local when needed.


    # Extract metadata
    page_count = extract_pdf_page_count(target_path)
    doc_title = title.strip() if title and title.strip() else filename

    # Mark other documents inactive
    db.query(models.Document).update({models.Document.is_active: False})

    # Create document record
    doc = models.Document(
        filename=filename,
        title=doc_title,
        category=category.strip() if category else "General",
        file_path=target_path,
        file_size=file_size,
        mime_type="application/pdf",
        page_count=page_count,
        status="PROCESSING",
        uploaded_by=current_user.id,
        is_active=True
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    log_audit_event(
        db=db,
        user_id=current_user.id,
        user_email=current_user.email,
        action="DOCUMENT_UPLOAD",
        resource=f"document:{doc.id}",
        metadata={"filename": filename, "file_size": file_size, "page_count": page_count},
        ip_address=request.client.host if request.client else "127.0.0.1"
    )

    # Process with Gemini
    success = process_document_with_gemini(doc, db)

    log_audit_event(
        db=db,
        user_id=current_user.id,
        user_email=current_user.email,
        action="DOCUMENT_PROCESS",
        resource=f"document:{doc.id}",
        metadata={"status": doc.status, "success": success},
        ip_address=request.client.host if request.client else "127.0.0.1"
    )

    return doc

@router.get("", response_model=List[schemas.DocumentResponse])
def list_documents(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all uploaded documents."""
    docs = db.query(models.Document).order_by(models.Document.id.desc()).all()
    # Attach uploader name
    res = []
    for d in docs:
        d_resp = schemas.DocumentResponse.from_orm(d)
        if d.uploader:
            d_resp.uploader_name = d.uploader.name
        res.append(d_resp)
    return res

@router.get("/active/latest", response_model=schemas.ActiveDocumentResponse)
def get_active_doc(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve the currently active document available for organizational AI queries."""
    doc = get_active_document(db)
    if not doc:
        return {"has_active_document": False, "document": None}
    
    d_resp = schemas.DocumentResponse.from_orm(doc)
    if doc.uploader:
        d_resp.uploader_name = doc.uploader.name

    return {
        "has_active_document": True,
        "document": d_resp
    }

@router.get("/{document_id}", response_model=schemas.DocumentResponse)
def get_document(
    document_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve details for a specific document."""
    doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    return doc

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    request: Request,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a document record (Admin only)."""
    doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    log_audit_event(
        db=db,
        user_id=current_user.id,
        user_email=current_user.email,
        action="DOCUMENT_DELETE",
        resource=f"document:{doc.id}",
        metadata={"filename": doc.filename},
        ip_address=request.client.host if request.client else "127.0.0.1"
    )

    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully"}
