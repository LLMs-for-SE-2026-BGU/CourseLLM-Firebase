
import os
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import dspy
from dotenv import load_dotenv
from src.ai.analyzer import MessageAnalyzer, AnalysisResult

# Load environment variables from .env file
load_dotenv()

# --- Pydantic Models for API --- #
class AnalyzeRequest(BaseModel):
    student_message: str
    message_history: List[str] = []

# --- FastAPI Application --- #
app = FastAPI()

# --- DSPy Configuration --- #
# Configure the language model
try:
    gemini = dspy.Google(model='gemini-1.5-flash', api_key=os.getenv("GEMINI_API_KEY"))
    dspy.settings.configure(lm=gemini)
    print("Successfully configured DSPy with Gemini model.")
except Exception as e:
    print(f"Error configuring DSPy: {e}")

# Initialize the DSPy module
analyzer = MessageAnalyzer()

# --- API Endpoints --- #
@app.post("/api/analyze-message", response_model=AnalysisResult)
def analyze_message(request: AnalyzeRequest):
    """
    Analyzes a student's message to extract intent, skills, and trajectory.
    """
    analysis_result = analyzer.forward(
        student_message=request.student_message, 
        message_history=request.message_history
    )
    return analysis_result

@app.get("/")
def read_root():
    return {"message": "DSPy analysis server is running."}
