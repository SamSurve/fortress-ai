import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from config import settings
from database import engine, Base
from seed import seed_database
from routers import auth_router, document_router, chat_router, user_router, audit_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed accounts
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

app = FastAPI(
    title="FORTRESS AI API",
    description="Private Organisational AI Assistant - SIH 2026 Prototype Backend",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers for structured, user-friendly errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    clean_msg = errors[0].get("msg") if errors else "Invalid request data"
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": clean_msg, "errors": errors}
    )

# Include Routers
app.include_router(auth_router.router)
app.include_router(document_router.router)
app.include_router(chat_router.router)
app.include_router(user_router.router)
app.include_router(audit_router.router)

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "FORTRESS AI Backend",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
