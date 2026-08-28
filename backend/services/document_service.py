import os
import shutil
import re
from pathlib import Path
from typing import Optional, Tuple
from sqlalchemy.orm import Session
import requests
from fastapi import HTTPException

from config import settings
import models

def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent directory traversal or invalid characters."""
    base = os.path.basename(filename)
    clean = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', base)
    return clean or "document.pdf"

def format_file_size(size_in_bytes: int) -> str:
    """Format bytes into readable string."""
    if size_in_bytes < 1024:
        return f"{size_in_bytes} B"
    elif size_in_bytes < 1024 * 1024:
        return f"{size_in_bytes / 1024:.1f} KB"
    else:
        return f"{size_in_bytes / (1024 * 1024):.2f} MB"

def _download_from_supabase(supabase_path: str) -> str:
    """Download a file from Supabase Storage to the writable uploads directory.
    Returns the local file path.
    """
    bucket = settings.SUPABASE_BUCKET
    # If path already includes bucket, split
    if '/' in supabase_path:
        parts = supabase_path.split('/', 1)
        bucket = parts[0]
        obj_path = parts[1]
    else:
        obj_path = supabase_path
    url = f"{settings.SUPABASE_URL}/storage/v1/object/{bucket}/{obj_path}"
    headers = {"Authorization": f"Bearer {settings.SUPABASE_KEY}"}
    response = requests.get(url, headers=headers, stream=True)
    if response.status_code != 200:
        raise HTTPException(status_code=404, detail="Supabase file not found")
    local_path = os.path.join(settings.UPLOADS_DIR, os.path.basename(obj_path))
    os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
    with open(local_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    return local_path


def _ensure_local(file_path: str) -> str:
    """Return a local file path, downloading from Supabase if necessary."""
    if os.path.exists(file_path):
        return file_path
    # Assume file_path stores Supabase path (bucket/filename) when not local
    return _download_from_supabase(file_path)


def extract_pdf_page_count(file_path: str) -> int:
    file_path = _ensure_local(file_path)
    """Extract page count from PDF file using pypdf or byte scan fallback."""
    try:
        import pypdf
        reader = pypdf.PdfReader(file_path)
        return max(1, len(reader.pages))
    except Exception:
        # Fallback byte scan for PDF page objects
        try:
            with open(file_path, "rb") as f:
                content = f.read()
                matches = re.findall(rb"/Type\s*/Page\b", content)
                pages_match = re.findall(rb"/Count\s+(\d+)", content)
                if pages_match:
                    return max(1, int(pages_match[-1]))
                if matches:
                    return max(1, len(matches))
        except Exception:
            pass
        return 1

def extract_pdf_text_per_page(file_path: str) -> list[dict]:
    file_path = _ensure_local(file_path)
    """Extract text by page for local context and verification."""
    pages_data = []
    try:
        import pypdf
        reader = pypdf.PdfReader(file_path)
        for idx, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            pages_data.append({
                "page_number": idx + 1,
                "text": text.strip()
            })
    except Exception:
        # Fallback reading
        try:
            with open(file_path, "r", encoding="latin-1", errors="ignore") as f:
                raw = f.read()
                # Basic text extraction from streams
                streams = re.findall(r'stream\s*(.*?)\s*endstream', raw, re.DOTALL)
                for idx, stream in enumerate(streams):
                    clean_lines = re.findall(r'\\((.*?)\\)\\s*Tj', stream)
                    if clean_lines:
                        pages_data.append({
                            "page_number": idx + 1,
                            "text": " ".join(clean_lines)
                        })
        except Exception:
            pass
    return pages_data

def get_active_document(db: Session) -> Optional[models.Document]:
    """Get the currently active document ready for Q&A."""
    # First try ready active document
    doc = db.query(models.Document).filter(
        models.Document.is_active == True,
        models.Document.status == "READY"
    ).order_by(models.Document.id.desc()).first()

    if not doc:
        # Fallback to any latest document
        doc = db.query(models.Document).filter(
            models.Document.is_active == True
        ).order_by(models.Document.id.desc()).first()

    return doc
