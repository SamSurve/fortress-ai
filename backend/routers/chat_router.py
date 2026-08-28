import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from auth import get_current_user, require_ai_access
from services.audit_service import log_audit_event
from services.document_service import get_active_document
from services.gemini_service import query_gemini_with_document

router = APIRouter(prefix="/chat", tags=["Chat & AI"])

@router.post("/query", response_model=schemas.ChatQueryResponse)
def query_ai(
    payload: schemas.ChatQueryRequest,
    request: Request,
    current_user: models.User = Depends(require_ai_access),
    db: Session = Depends(get_db)
):
    """
    Send question to Gemini grounded on the active organizational PDF.
    Persists query and answer to SQLite and logs audit event.
    """
    question_clean = payload.question.strip()
    if not question_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty."
        )

    # Determine document
    if payload.document_id:
        doc = db.query(models.Document).filter(models.Document.id == payload.document_id).first()
    else:
        doc = get_active_document(db)

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No document is currently active. Please contact an administrator to upload a document."
        )

    if doc.status != "READY":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document '{doc.filename}' is not ready yet (Current status: {doc.status})."
        )

    # Query Gemini
    try:
        answer, sources_data = query_gemini_with_document(
            question=question_clean,
            document=doc
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI inference error: {str(e)}"
        )

    # Convert sources to SourceCitation models
    sources = [
        schemas.SourceCitation(
            document_name=s["document_name"],
            page_number=s.get("page_number"),
            snippet=s.get("snippet")
        )
        for s in sources_data
    ]

    # Persist chat messages
    user_msg = models.ChatMessage(
        user_id=current_user.id,
        document_id=doc.id,
        role="user",
        content=question_clean
    )
    db.add(user_msg)

    ai_msg = models.ChatMessage(
        user_id=current_user.id,
        document_id=doc.id,
        role="assistant",
        content=answer,
        sources_json=json.dumps(sources_data)
    )
    db.add(ai_msg)
    db.commit()

    # Log audit event
    log_audit_event(
        db=db,
        user_id=current_user.id,
        user_email=current_user.email,
        action="AI_QUERY",
        resource=f"document:{doc.id}",
        metadata={"question": question_clean[:100], "sources_count": len(sources)},
        ip_address=request.client.host if request.client else "127.0.0.1"
    )

    return schemas.ChatQueryResponse(
        answer=answer,
        sources=sources,
        disclaimer="AI-generated response. Verify important information against the cited source.",
        document_id=doc.id,
        document_name=doc.filename
    )

@router.get("/history", response_model=List[schemas.ChatMessageResponse])
def get_chat_history(
    current_user: models.User = Depends(require_ai_access),
    db: Session = Depends(get_db)
):
    """Retrieve chat history for the current user."""
    messages = db.query(models.ChatMessage).filter(
        models.ChatMessage.user_id == current_user.id
    ).order_by(models.ChatMessage.created_at.asc()).all()

    result = []
    for msg in messages:
        sources_list = []
        if msg.sources_json:
            try:
                parsed = json.loads(msg.sources_json)
                sources_list = [
                    schemas.SourceCitation(
                        document_name=s["document_name"],
                        page_number=s.get("page_number"),
                        snippet=s.get("snippet")
                    )
                    for s in parsed
                ]
            except Exception:
                pass

        result.append(schemas.ChatMessageResponse(
            id=msg.id,
            role=msg.role,
            content=msg.content,
            sources=sources_list,
            created_at=msg.created_at
        ))
    return result

@router.delete("/history")
def clear_chat_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clear chat history for the current user."""
    db.query(models.ChatMessage).filter(models.ChatMessage.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Chat history cleared successfully."}
