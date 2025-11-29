"""
FastAPI service for DSPy integration
Run with: uvicorn src.ai.dspy.api:app --reload --port 8001
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import os

from .config import configure_dspy
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

# Configure CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:9002", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DSPy on startup
@app.on_event("startup")
async def startup_event():
    """Configure DSPy with Google Gemini on startup"""
    try:
        configure_dspy()
        print("✅ DSPy configured successfully with Google Gemini")
    except Exception as e:
        print(f"❌ Failed to configure DSPy: {e}")
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
        "version": "1.0.0"
    }


@app.post("/answer", response_model=QuestionResponse)
async def answer_question(request: QuestionRequest):
    """
    Answer a student's question using course materials with DSPy RAG
    """
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
    """
    Assess student's answer and provide feedback
    """
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
    """
    Summarize course materials
    """
    try:
        assistant = get_assistant()
        result = assistant.summarize_materials(materials=request.materials)
        return SummarizeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/quiz")
async def generate_quiz(request: QuizRequest):
    """
    Generate quiz questions from course material
    """
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


