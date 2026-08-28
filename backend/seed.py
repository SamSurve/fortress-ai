import os
import shutil
from pathlib import Path
from sqlalchemy.orm import Session

from database import engine, SessionLocal, Base
import models
from auth import hash_password
from config import settings
from services.document_service import extract_pdf_page_count
from services.audit_service import log_audit_event

def seed_database():
    """Create tables and initialize standard demo accounts."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed Admin User
        admin_user = db.query(models.User).filter(models.User.email == "admin@company.com").first()
        if not admin_user:
            admin_user = models.User(
                name="Admin User",
                email="admin@company.com",
                password_hash=hash_password("admin123"),
                role="ADMIN",
                can_upload=True,
                can_access_ai=True,
                status="active"
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            log_audit_event(db, admin_user.id, admin_user.email, "SEED_USER", "users", {"role": "ADMIN"})
            print("Created Admin user: admin@company.com / admin123")
        else:
            # Ensure permissions are set correctly
            admin_user.role = "ADMIN"
            admin_user.can_upload = True
            admin_user.can_access_ai = True
            db.commit()

        # Seed Employee User
        employee_user = db.query(models.User).filter(models.User.email == "employee@company.com").first()
        if not employee_user:
            employee_user = models.User(
                name="Rahul Sharma",
                email="employee@company.com",
                password_hash=hash_password("employee123"),
                role="EMPLOYEE",
                can_upload=False,
                can_access_ai=True,
                status="active"
            )
            db.add(employee_user)
            db.commit()
            db.refresh(employee_user)
            log_audit_event(db, employee_user.id, employee_user.email, "SEED_USER", "users", {"role": "EMPLOYEE"})
            print("Created Employee user: employee@company.com / employee123")
        else:
            employee_user.role = "EMPLOYEE"
            employee_user.can_access_ai = True
            db.commit()

        # Check for sample document
        sample_doc_src = Path(__file__).resolve().parent.parent / "sample_documents" / "P101_Inspection_Report.pdf"
        dest_doc_path = Path(settings.UPLOADS_DIR) / "P101_Inspection_Report.pdf"

        if sample_doc_src.exists() and not dest_doc_path.exists():
            shutil.copy(str(sample_doc_src), str(dest_doc_path))

        if dest_doc_path.exists():
            existing_doc = db.query(models.Document).filter(models.Document.filename == "P101_Inspection_Report.pdf").first()
            if not existing_doc:
                file_size = dest_doc_path.stat().st_size
                page_count = extract_pdf_page_count(str(dest_doc_path))
                doc = models.Document(
                    filename="P101_Inspection_Report.pdf",
                    title="Pump P-101 Industrial Inspection & Vibration Health Report",
                    category="Equipment Maintenance",
                    file_path=str(dest_doc_path),
                    file_size=file_size,
                    mime_type="application/pdf",
                    page_count=page_count,
                    gemini_file_reference="fortress://docs/1/P101_Inspection_Report.pdf",
                    status="READY",
                    uploaded_by=admin_user.id,
                    is_active=True
                )
                db.add(doc)
                db.commit()
                print(f"Pre-seeded active document: P101_Inspection_Report.pdf ({page_count} pages)")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
