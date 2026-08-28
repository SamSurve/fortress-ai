import os
import re
import json
import base64
import httpx
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session

from config import settings
import models
from services.document_service import _ensure_local

SYSTEM_INSTRUCTION = """
You are FORTRESS AI, an enterprise-grade private organizational AI assistant.
You are assisting verified personnel with queries regarding company technical documentation.

CRITICAL OPERATIONAL RULES:
1. Answer the question STRICTLY and ONLY using the facts, figures, dates, numbers, and statements present in the provided document.
2. If the answer is NOT explicitly contained in the provided document, do NOT speculate, do NOT extrapolate, and do NOT use outside knowledge. You MUST respond with:
"I couldn't find sufficient information in the provided document."
3. When information is found in the document, specify the page number where the information is located (e.g. "[Page 1]", "[Page 2]", or "[Page 3]").
4. Never invent or guess a page number. If the exact page is uncertain, do not fabricate one.
5. Maintain a professional, concise enterprise tone.
"""

def extract_sources_from_answer_and_doc(answer: str, doc_name: str, pages_data: list) -> List[Dict[str, Any]]:
    """Reliably parse cited page numbers from the AI response or document text."""
    # If the response indicates out-of-scope / not found, do not attach misleading page citations
    lower_ans = answer.lower()
    if (
        "couldn't find" in lower_ans or
        "cannot find" in lower_ans or
        "not found" in lower_ans or
        "insufficient information" in lower_ans or
        "not mentioned" in lower_ans or
        "not contained" in lower_ans
    ):
        return []

    sources = []
    
    # Check if answer contains explicit Page citations like [Page 1] or Page 2
    page_matches = re.findall(r'\[?Page\s*(\d+)\]?', answer, re.IGNORECASE)
    cited_pages = set()
    for m in page_matches:
        try:
            cited_pages.add(int(m))
        except ValueError:
            pass

    if cited_pages:
        for p in sorted(cited_pages):
            snippet = None
            for page in pages_data:
                if page.get("page_number") == p:
                    text = page.get("text", "")
                    if text:
                        clean_text = " ".join(text.split())
                        snippet = clean_text[:140] + "..." if len(clean_text) > 140 else clean_text
                    break
            sources.append({
                "document_name": doc_name,
                "page_number": p,
                "snippet": snippet
            })
    else:
        # If no specific page mentioned, add general document reference without inventing page
        sources.append({
            "document_name": doc_name,
            "page_number": None,
            "snippet": None
        })

    return sources

def upload_file_to_gemini_files_api(file_path: str, mime_type: str = "application/pdf") -> Optional[str]:
    """
    Uploads a file to Google Gemini Files API and returns the file URI.
    Uses Google AI Studio / Gemini v1beta Files upload protocol.
    """
    api_key = (settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")).strip()
    if not api_key:
        return None

    if not os.path.exists(file_path):
        return None

    try:
        file_size = os.path.getsize(file_path)
        with open(file_path, "rb") as f:
            file_bytes = f.read()

        upload_url = f"https://generativelanguage.googleapis.com/upload/v1beta/files?key={api_key}"
        headers = {
            "x-goog-api-key": api_key,
            "X-Goog-Upload-Command": "start, upload, finalize",
            "X-Goog-Upload-Header-Content-Length": str(file_size),
            "X-Goog-Upload-Header-Content-Type": mime_type,
            "Content-Type": mime_type
        }

        with httpx.Client(timeout=45.0) as client:
            resp = client.post(upload_url, headers=headers, content=file_bytes)
            if resp.status_code == 200:
                data = resp.json()
                file_obj = data.get("file", {})
                uri = file_obj.get("uri")
                return uri
    except Exception as e:
        print(f"[WARN] Gemini Files API upload fallback: {e}")

    return None

def process_document_with_gemini(document: models.Document, db: Session) -> bool:
    """
    Process the uploaded document with Gemini.
    Validates document structure, extracts page count, and prepares Gemini reference.
    """
    try:
        # Resolve file path, downloading from Supabase if needed
        local_path = _ensure_local(document.file_path)
        if not os.path.exists(local_path):
            document.status = "FAILED"
            document.error_message = "File not found on server disk"
            db.commit()
            return False

        # Extract text/pages to verify readable format
        pages = extract_pdf_text_per_page(document.file_path)
        if not pages and document.file_size == 0:
            document.status = "FAILED"
            document.error_message = "Document is empty or unreadable"
            db.commit()
            return False

        # If Gemini API Key is configured, upload to Gemini Files API
        gemini_uri = upload_file_to_gemini_files_api(document.file_path, document.mime_type)
        if gemini_uri:
            document.gemini_file_reference = gemini_uri
        else:
            document.gemini_file_reference = f"fortress://local-docs/{document.id}/{document.filename}"

        # Update status to READY
        document.status = "READY"
        document.error_message = None
        db.commit()
        return True

    except Exception as e:
        document.status = "FAILED"
        document.error_message = str(e)
        db.commit()
        return False

def query_gemini_with_document(
    question: str,
    document: models.Document,
    chat_history: Optional[List[Dict[str, str]]] = None
) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Sends question and document context to Google Gemini.
    Strictly answers based on the uploaded PDF.
    """
    api_key = (settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")).strip()

    if not api_key:
        raise RuntimeError("Gemini API key is not configured. Please configure GEMINI_API_KEY in backend/.env or system environment variables.")

    if not os.path.exists(document.file_path):
        raise RuntimeError(f"Document file '{document.filename}' was not found on disk at {document.file_path}")

    # Read document pages and text
    pages_data = extract_pdf_text_per_page(document.file_path)
    
    # Format document text with explicit page markers
    doc_context_parts = [f"=== ACTIVE DOCUMENT: {document.filename} (Title: {document.title}) ==="]
    for p in pages_data:
        doc_context_parts.append(f"\n--- [Page {p['page_number']}] ---\n{p['text']}")
    doc_context = "\n".join(doc_context_parts)

    prompt_text = f"""{SYSTEM_INSTRUCTION}

DOCUMENT CONTENT:
{doc_context}

USER QUESTION:
{question}
"""

    # Build contents payload
    parts = []

    # If we have a Gemini Files API URI, include fileData reference
    if document.gemini_file_reference and document.gemini_file_reference.startswith("https://generativelanguage.googleapis.com"):
        parts.append({
            "fileData": {
                "fileUri": document.gemini_file_reference,
                "mimeType": "application/pdf"
            }
        })

    # Add the prompt and structured page-indexed content
    parts.append({"text": prompt_text})

    payload = {
        "contents": [
            {
                "parts": parts
            }
        ],
        "generationConfig": {
            "temperature": 0.05,
            "topP": 0.95,
            "maxOutputTokens": 1024
        }
    }

    # Try standard stable Gemini model endpoints
    models_to_try = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro"
    ]

    last_error = None
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": api_key
    }

    for model_name in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        try:
            with httpx.Client(timeout=35.0) as client:
                response = client.post(
                    url,
                    headers=headers,
                    json=payload
                )
                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        content_parts = candidates[0].get("content", {}).get("parts", [])
                        if content_parts:
                            raw_answer = content_parts[0].get("text", "").strip()
                            sources = extract_sources_from_answer_and_doc(raw_answer, document.filename, pages_data)
                            return raw_answer, sources
                else:
                    last_error = f"Gemini API ({model_name}) returned HTTP {response.status_code}: {response.text}"
        except Exception as e:
            last_error = f"Gemini connection error ({model_name}): {str(e)}"

    raise RuntimeError(f"Failed to query Gemini API. Details: {last_error}")
