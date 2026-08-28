"""
Live Gemini API and PDF Grounding Verification
"""
import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_dir))

from config import settings
import models
from database import engine, SessionLocal, Base
from seed import seed_database
from services.document_service import get_active_document, extract_pdf_text_per_page
from services.gemini_service import process_document_with_gemini, query_gemini_with_document

def verify_live():
    print("=" * 70)
    print(" FORTRESS AI - LIVE GEMINI API VERIFICATION")
    print("=" * 70)

    print(f"[*] Checking configured GEMINI_API_KEY...")
    api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
    print(f"[*] API Key present: {bool(api_key)} (Length: {len(api_key)})")

    # Initialize DB and Seed
    Base.metadata.create_all(bind=engine)
    seed_database()
    db = SessionLocal()

    try:
        doc = get_active_document(db)
        if not doc:
            print("[!] No active document found. Creating and seeding...")
            seed_database()
            doc = get_active_document(db)

        print(f"[*] Active Document in SQLite: '{doc.filename}' (ID: {doc.id}, Pages: {doc.page_count})")
        print(f"[*] File Path: {doc.file_path}")
        print(f"[*] Processing document with Gemini...")

        success = process_document_with_gemini(doc, db)
        print(f"[*] Document Process Status: {doc.status} (Gemini Ref: {doc.gemini_file_reference})")

        # Test Questions
        test_queries = [
            ("QUESTION 1", "What was the main issue identified in Pump P-101?"),
            ("QUESTION 2", "What maintenance action was recommended?"),
            ("QUESTION 3", "What was the vibration level?"),
            ("QUESTION 4", "When was the inspection conducted?"),
            ("QUESTION 5 (Out-of-Scope)", "What is Microsoft's market capitalization in 2026?")
        ]

        print("\n" + "=" * 70)
        print(" RUNNING REAL GEMINI QUERIES ON P101_Inspection_Report.pdf")
        print("=" * 70)

        for label, q in test_queries:
            print(f"\n--- {label} ---")
            print(f"Question: \"{q}\"")
            answer, sources = query_gemini_with_document(q, doc)
            print(f"\n[Gemini Answer]:\n{answer}")
            print(f"\n[Sources / Citations]:")
            if sources:
                for s in sources:
                    page_str = f"Page {s['page_number']}" if s.get('page_number') else "No page"
                    snippet_str = f" - Snippet: \"{s['snippet']}\"" if s.get('snippet') else ""
                    print(f"  • Document: {s['document_name']} | {page_str}{snippet_str}")
            else:
                print("  • (No source citations - Out of Scope / Refusal)")

        print("\n" + "=" * 70)
        print(" LIVE GEMINI VERIFICATION COMPLETED SUCCESSFULLY!")
        print("=" * 70)

    finally:
        db.close()

if __name__ == "__main__":
    verify_live()
