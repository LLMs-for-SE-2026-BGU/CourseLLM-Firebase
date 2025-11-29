"""
DSPy Configuration for Course Material RAG System
"""
import os
import dspy
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv('.env.local')

def configure_dspy(
    model_name: str = "gemini-2.0-flash-exp",
    api_key: Optional[str] = None,
    temperature: float = 0.7
):
    """
    Configure DSPy with Google Gemini model
    
    Args:
        model_name: Google Gemini model to use
        api_key: Google API key (defaults to GOOGLE_GENAI_API_KEY env var)
        temperature: Model temperature for response generation
    """
    # Get API key from environment if not provided
    if api_key is None:
        api_key = os.getenv("GOOGLE_GENAI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    
    if not api_key:
        raise ValueError(
            "Google API key not found. Set GOOGLE_GENAI_API_KEY or GOOGLE_API_KEY environment variable"
        )
    
    # Configure Google Gemini model
    lm = dspy.Google(
        model=model_name,
        api_key=api_key,
        temperature=temperature
    )
    
    dspy.settings.configure(lm=lm)
    
    return lm


def get_dspy_lm():
    """Get or create configured DSPy language model"""
    if not dspy.settings.lm:
        configure_dspy()
    return dspy.settings.lm
