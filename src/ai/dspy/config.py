"""
Configuration for Course Material RAG System & Firebase
"""
import os
import dspy
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # --- Project Config ---
    ENVIRONMENT: str = "local"
    FIREBASE_PROJECT_ID: str = "coursepilot2-68762807-63d49"
    
    # --- Google / Gemini Config ---
    # Optional because we might not need it if using Vertex AI in cloud
    GOOGLE_GENAI_API_KEY: Optional[str] = None 
    GOOGLE_API_KEY: Optional[str] = None # Fallback name
    GEMINI_MODEL_NAME: str = "gemini-2.0-flash-exp"
    GEMINI_TEMPERATURE: float = 0.7

    # --- Emulator Hosts (Only set in local .env) ---
    FIREBASE_AUTH_EMULATOR_HOST: Optional[str] = None
    FIRESTORE_EMULATOR_HOST: Optional[str] = None
    FIREBASE_STORAGE_EMULATOR_HOST: Optional[str] = None

    class Config:
        env_file = ".env.local" # Points to your existing local env file
        extra = "ignore"       # Ignore variables we don't need (like NEXT_PUBLIC_...)

def get_settings():
    return Settings()

def configure_dspy(settings: Settings = None):
    """
    Configure DSPy with Google Gemini model using Pydantic settings
    """
    if settings is None:
        settings = get_settings()

    api_key = settings.GOOGLE_GENAI_API_KEY or settings.GOOGLE_API_KEY
    
    if not api_key:
        print("⚠️ Warning: Google API key not found in environment.")
        return

    # Configure Google Gemini model
    lm = dspy.Google(
        model=settings.GEMINI_MODEL_NAME,
        api_key=api_key,
        temperature=settings.GEMINI_TEMPERATURE
    )
    
    dspy.settings.configure(lm=lm)
    return lm