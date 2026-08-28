import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="EMPLOYEE", nullable=False)  # "ADMIN" or "EMPLOYEE"
    can_upload = Column(Boolean, default=False, nullable=False)
    can_access_ai = Column(Boolean, default=True, nullable=False)
    status = Column(String(50), default="active", nullable=False)  # "active" or "disabled"
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    documents = relationship("Document", back_populates="uploader")
    audit_logs = relationship("AuditLog", back_populates="user")
    chat_messages = relationship("ChatMessage", back_populates="user")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="General", nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, default=0, nullable=False)
    mime_type = Column(String(100), default="application/pdf", nullable=False)
    page_count = Column(Integer, default=1, nullable=False)
    gemini_file_reference = Column(String(500), nullable=True)
    status = Column(String(50), default="UPLOADING", nullable=False)  # UPLOADING, PROCESSING, READY, FAILED
    error_message = Column(Text, nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    uploader = relationship("User", back_populates="documents")
    chat_messages = relationship("ChatMessage", back_populates="document")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_email = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False)  # LOGIN, LOGOUT, DOCUMENT_UPLOAD, DOCUMENT_PROCESS, AI_QUERY, PERMISSION_CHANGE
    resource = Column(String(255), nullable=True)
    metadata_json = Column(Text, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1", nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="audit_logs")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    sources_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="chat_messages")
    document = relationship("Document", back_populates="chat_messages")
