from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
import time

from app.routes.analyze_routes import router as analyze_router
from app.config.config import settings

app = FastAPI(
    title="ProofNexa NLP Engine",
    version="1.0.0",
)

# Health Check
@app.get("/health")
def health_check():
    return { "status": "ok", "service": "proofnexa-nlp", "time": time.time() }

@app.get("/")
def root():
    return {"message": "NLP Engine is running"}

# Global Exception Handler
@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    print(f"CRITICAL ERROR: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "detail": str(exc)}
    )

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(analyze_router)
