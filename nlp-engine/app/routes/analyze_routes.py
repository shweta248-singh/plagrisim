from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel, Field

from app.controllers.analyze_controller import (
    analyze_text_controller,
    compare_two_texts_controller,
)
from app.config.config import settings
from app.config.database import get_db_status

router = APIRouter()

class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1)
    submissionId: Optional[str] = None
    submission_id: Optional[str] = None
    existing_texts: Optional[List[str]] = None
    existingTexts: Optional[List[str]] = None


class CompareTwoRequest(BaseModel):
    text1: str = Field(..., min_length=1)
    text2: str = Field(..., min_length=1)


@router.get("/health")
def health_check():
    db_ok = get_db_status()
    return {
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "mongo_uri": settings.MONGO_URI.split("@")[-1] if "@" in settings.MONGO_URI else "local",
        "version": settings.VERSION,
    }


@router.get("/version")
def get_version():
    return {"version": settings.VERSION}


@router.post("/analyze-text")
def analyze_text(payload: AnalyzeRequest):
    try:
        text = (payload.text or "").strip()
        submission_id = payload.submissionId or payload.submission_id
        
        print(f"[NLP ENGINE] Received analyze-text request. Length: {len(text)}, SubmissionId: {submission_id}")

        if len(text) < 5:
            print("[NLP ENGINE] Text too short. Returning 0 similarity.")
            return {
                "success": True,
                "similarityScore": 0,
                "similarity": 0,
                "matches": [],
                "summary": "Not enough text for reliable analysis.",
            }

        existing_texts = payload.existing_texts or payload.existingTexts or []

        if existing_texts:
            print(f"[NLP ENGINE] Comparing against {len(existing_texts)} provided texts.")
            result = analyze_text_controller(
                text,
                existing_texts=existing_texts,
            )
        else:
            result = analyze_text_controller(
                text,
                submission_id=submission_id,
            )
        
        print(f"[NLP ENGINE] Analysis complete. Score: {result.get('similarityScore')}%")
        return result

    except HTTPException:
        raise
    except Exception as e:
        print(f"[NLP ENGINE] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compare-two-texts")
def compare_two_texts(payload: CompareTwoRequest):
    try:
        text1 = (payload.text1 or "").strip()
        text2 = (payload.text2 or "").strip()

        if len(text1) < 5 or len(text2) < 5:
            return {
                "success": True,
                "similarityScore": 0,
                "similarity": 0,
                "matches": [],
                "summary": "Not enough text for reliable comparison.",
            }

        return compare_two_texts_controller(text1, text2)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))