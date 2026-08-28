import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field

# ----------------- AUTH SCHEMAS -----------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class TokenData(BaseModel):
    user_id: int
    email: str
    role: str

# ----------------- USER SCHEMAS -----------------
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "EMPLOYEE"
    can_upload: bool = False
    can_access_ai: bool = True
    status: str = "active"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class PermissionUpdateRequest(BaseModel):
    can_upload: Optional[bool] = None
    can_access_ai: Optional[bool] = None
    status: Optional[str] = None
    role: Optional[str] = None

# ----------------- DOCUMENT SCHEMAS -----------------
class DocumentBase(BaseModel):
    title: str
    category: str = "General"

class DocumentResponse(BaseModel):
    id: int
    filename: str
    title: str
    category: str
    file_size: int
    mime_type: str
    page_count: int
    gemini_file_reference: Optional[str] = None
    status: str  # UPLOADING, PROCESSING, READY, FAILED
    error_message: Optional[str] = None
    uploaded_by: int
    uploader_name: Optional[str] = None
    is_active: bool
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class ActiveDocumentResponse(BaseModel):
    has_active_document: bool
    document: Optional[DocumentResponse] = None

# ----------------- CHAT SCHEMAS -----------------
class SourceCitation(BaseModel):
    document_name: str
    page_number: Optional[int] = None
    snippet: Optional[str] = None

class ChatQueryRequest(BaseModel):
    question: str = Field(..., min_length=1)
    document_id: Optional[int] = None

class ChatQueryResponse(BaseModel):
    answer: str
    sources: List[SourceCitation] = []
    disclaimer: str = "AI-generated response. Verify important information against the cited source."
    document_id: Optional[int] = None
    document_name: Optional[str] = None

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    sources: List[SourceCitation] = []
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# ----------------- AUDIT SCHEMAS -----------------
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_email: str
    action: str
    resource: Optional[str] = None
    metadata_json: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# ----------------- DASHBOARD SCHEMAS -----------------
class DashboardStatsResponse(BaseModel):
    total_documents: int
    total_users: int
    ai_queries_today: int
    storage_used_bytes: int
    storage_used_formatted: str
    active_document: Optional[DocumentResponse] = None
    recent_documents: List[DocumentResponse] = []
    recent_activity: List[AuditLogResponse] = []
