# FORTRESS AI
### Private Organisational AI Assistant (Smart India Hackathon 2026 Prototype)

FORTRESS AI is a zero-data-leakage private organisational AI assistant designed for high-security enterprise environments.

---

## 🌟 Core Working Workflow

```
ADMIN LOGIN (admin@company.com)
  ↓
ADMIN DASHBOARD (/admin/dashboard)
  ↓
UPLOAD PDF (P101_Inspection_Report.pdf)
  ↓
PROCESS PDF WITH GEMINI (Status: Ready)
  ↓
LOGOUT
  ↓
EMPLOYEE LOGIN (employee@company.com)
  ↓
INTERNAL AI WORKSPACE (/workspace)
  ↓
EMPLOYEE ASKS INDUSTRIAL QUESTIONS
  ↓
GEMINI RESPONDS GROUNDED IN THE SAME PERSISTED PDF
  ↓
SOURCE ATTRIBUTION + PAGE CITATIONS DISPLAYED
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Access / Route |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@company.com` | `admin123` | `/admin/dashboard`, `/admin/documents`, `/admin/users`, `/admin/audit-logs` |
| **Employee** | `employee@company.com` | `employee123` | `/workspace` (Admin controls strictly hidden & restricted) |

*Note: The login page includes convenient **One-Click Demo Fill** buttons for instant testing.*

---

## 🎨 Enterprise Design System

- **Primary Dark Navy**: `#0B1730`
- **Secondary Navy**: `#13254A`
- **Primary Blue**: `#2563EB`
- **Light Blue Accent**: `#E8F1FF`
- **Page Background**: `#F5F7FB`
- **Card Background**: `#FFFFFF`
- **Primary Text**: `#14213D`
- **Secondary Text**: `#64748B`
- **Borders**: `#D9E1EC`
- **Status Green**: `#10B981` / `#ECFDF5`
- **Status Amber**: `#F59E0B` / `#FFFBEB`

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS (Enterprise SaaS theme), Lucide Icons.
- **Backend API**: Python FastAPI, Pydantic v2, SQLAlchemy, PBKDF2/SHA-256 salted password hashing, JWT Bearer authentication.
- **Database**: SQLite (`fortress.db`) with full persistence for Users, Documents, Audit Logs, and Messages.
- **AI Engine**: Google Gemini API (`gemini-2.0-flash` / `gemini-1.5-flash`) with server-side document grounding and strict anti-hallucination refusal.
- **Storage**: Persistent local directory `backend/uploads/`.

---

## 🚀 Quick Start & Running

### Option 1: One-Click Startup (Windows)
Double-click `start_all.bat` or run:
```bat
start_all.bat
```
This automatically starts both the backend API (`http://localhost:8000`) and frontend client (`http://localhost:3000`).

---

### Option 2: Step-by-Step Manual Startup

#### 1. Backend Startup
```bat
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
python seed.py
python main.py
```
*Backend runs on `http://localhost:8000` (Interactive Swagger Docs: `http://localhost:8000/docs`).*

#### 2. Frontend Startup
```bat
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## ⚙️ Configuring Google Gemini API Key

Configure your Gemini API key in `backend/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
Or set it as a system environment variable before starting:
```bat
set GEMINI_API_KEY=your_gemini_key
```

---

## 🧪 Automated Verification Suite

Run the end-to-end verification suite covering all requirements:
```bat
python test_system.py
```

### Verified Scenarios:
1. Database schema initialization & account seeding.
2. Salted PBKDF2 password hashing & verification.
3. Signed JWT Bearer token generation and decoding.
4. `P101_Inspection_Report.pdf` multi-page structure & text extraction.
5. SQLite document persistence across sessions.
6. Role-based access control (Employee blocked from uploading PDFs).
7. AI Query 1: *"What was the main issue identified in Pump P-101?"* → Grounded response + `[Page 1]` source.
8. AI Query 2: *"What maintenance action was recommended?"* → Reuses same persisted PDF + `[Page 3]` source.
9. AI Query 3: *"What was the measured vibration level?"* → Exact `7.2 mm/s RMS` metric extracted.
10. AI Query 4: *"When was the inspection conducted?"* → Extracted date `August 14, 2026`.
11. AI Query 5 (Out-of-Scope): *"What is the stock price of Apple in 2026?"* → Strictly refuses without hallucinating (*"I couldn't find sufficient information in the provided document."*).
12. Dynamic user permission updates (disabling AI access immediately restricts chat with 403 Forbidden).
13. Security compliance audit logging (`LOGIN`, `DOCUMENT_UPLOAD`, `AI_QUERY`, `PERMISSION_CHANGE`).
14. Session & file persistence across complete server restarts.

---

## 🔒 Security Highlights

- **Zero Client Key Exposure**: `GEMINI_API_KEY` is strictly encapsulated server-side.
- **Strict Role Boundaries**: Backend verifies roles on every protected endpoint (`require_admin`, `require_upload_access`, `require_ai_access`).
- **Grounded AI Guardrails**: Strict prompt enforcement prevents hallucination or unauthorized external knowledge leakage.
- **Audit Logging**: Every authentication, document ingestion, AI query, and permission alteration is cryptographically logged with IP address and timestamp.
