"""
FastAPI service for DSPy integration & Firebase Backend
Run with: uvicorn src.ai.dspy.api:app --reload --port 8001
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import os

# Firebase & Auth Imports
import firebase_admin
from firebase_admin import credentials, firestore
import google.auth.credentials # <--- Added this

from .config import configure_dspy, get_settings
from .modules import (
    CourseMaterialRAG,
    SocraticTeacher,
    StudentAssessment,
    MaterialSummarizer,
    QuizGenerator,
    PersonalizedLearningAssistant
)

# Initialize FastAPI
app = FastAPI(
    title="CourseLLM DSPy API",
    description="DSPy-powered LLM prompting service for course materials",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:9002", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CREDENTIAL FIX START ---
class EmulatorCreds(google.auth.credentials.Credentials):
    """Dummy credentials to bypass Google Cloud checks when using Emulators"""
    def refresh(self, request):
        pass
# --- CREDENTIAL FIX END ---

# Global DB Client
db = None

@app.on_event("startup")
async def startup_event():
    """Configure DSPy and Firebase on startup"""
    global db
    settings = get_settings()

    # 1. Configure DSPy
    try:
        configure_dspy(settings)
        print("✅ DSPy configured successfully")
    except Exception as e:
        print(f"❌ Failed to configure DSPy: {e}")

    # 2. Configure Firebase (Emulator vs Cloud Logic)
    try:
        if not firebase_admin._apps: # Only initialize if not already initialized
            if settings.FIREBASE_AUTH_EMULATOR_HOST:
                # --- LOCAL EMULATOR MODE ---
                print(f"🔧 Connecting to Firebase Emulators at {settings.FIRESTORE_EMULATOR_HOST}...")
                
                # Force env vars for Admin SDK
                os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = settings.FIREBASE_AUTH_EMULATOR_HOST
                os.environ["FIRESTORE_EMULATOR_HOST"] = settings.FIRESTORE_EMULATOR_HOST
                os.environ["FIREBASE_STORAGE_EMULATOR_HOST"] = settings.FIREBASE_STORAGE_EMULATOR_HOST
                
                # Use dummy credentials to satisfy the SDK
                dummy_creds = EmulatorCreds()
                firebase_admin.initialize_app(credential=dummy_creds, options={
                    'projectId': settings.FIREBASE_PROJECT_ID
                })
            else:
                # --- CLOUD PRODUCTION MODE ---
                print("☁️ Connecting to Real Firebase Cloud...")
                # Uses Application Default Credentials (ADC) provided by Cloud Run
                cred = credentials.ApplicationDefault()
                firebase_admin.initialize_app(cred, options={
                    'projectId': settings.FIREBASE_PROJECT_ID
                })
        
        # Initialize Firestore Client
        db = firestore.client()
        print("✅ Firebase initialized successfully")
        
    except Exception as e:
        print(f"❌ Failed to configure Firebase: {e}")
        raise

# Request/Response Models
class QuestionRequest(BaseModel):
    course_materials: List[str]
    question: str
    use_socratic: bool = False

class QuestionResponse(BaseModel):
    response: str
    type: str

class AssessmentRequest(BaseModel):
    question: str
    student_answer: str
    correct_answer: str
    topic: str

class AssessmentResponse(BaseModel):
    assessment: str
    understanding_level: str
    follow_up_questions: List[str]

class SummarizeRequest(BaseModel):
    materials: List[str]

class SummarizeResponse(BaseModel):
    summary: str
    key_points: List[str]

class QuizRequest(BaseModel):
    material_content: str
    difficulty: str = "medium"
    num_questions: int = 5

# Initialize modules (lazy loading)
_assistant = None

def get_assistant():
    global _assistant
    if _assistant is None:
        _assistant = PersonalizedLearningAssistant()
    return _assistant

# API Endpoints
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "CourseLLM DSPy API",
        "version": "1.0.0",
        "firebase_project": get_settings().FIREBASE_PROJECT_ID
    }

@app.post("/answer", response_model=QuestionResponse)
async def answer_question(request: QuestionRequest):
    try:
        assistant = get_assistant()
        result = assistant.answer_question(
            course_materials=request.course_materials,
            question=request.question,
            use_socratic=request.use_socratic
        )
        return QuestionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/assess", response_model=AssessmentResponse)
async def assess_answer(request: AssessmentRequest):
    try:
        assistant = get_assistant()
        result = assistant.assess_and_provide_feedback(
            question=request.question,
            student_answer=request.student_answer,
            correct_answer=request.correct_answer,
            topic=request.topic
        )
        return AssessmentResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/summarize", response_model=SummarizeResponse)
async def summarize_materials(request: SummarizeRequest):
    try:
        assistant = get_assistant()
        result = assistant.summarize_materials(materials=request.materials)
        return SummarizeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/quiz")
async def generate_quiz(request: QuizRequest):
    try:
        quiz_gen = QuizGenerator()
        result = quiz_gen(
            material_content=request.material_content,
            difficulty=request.difficulty,
            num_questions=request.num_questions
        )
        return {"questions": result.questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)