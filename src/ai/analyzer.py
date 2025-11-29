
from pydantic import BaseModel, Field
from typing import List, Literal
import dspy

# Define the structured output model using Pydantic
# This ensures the LLM provides the data in the exact format we need.
class AnalysisResult(BaseModel):
    intent: Literal["ASK_EXPLANATION", "ASK_EXAMPLES", "OFF_TOPIC"] = Field(description="The primary intent of the student's message.")
    skills: List[str] = Field(description="A list of academic skills or topics mentioned in the message.")
    trajectory: Literal["ON_TRACK", "STRUGGLING"] = Field(description="An assessment of whether the student is progressing well or needs help.")

# Define the DSPy Signature for the task
class AnalyzeStudentMessage(dspy.Signature):
    """
    Analyze a student's message within the context of a conversation history.
    Extract the student's intent, the skills they are discussing, and assess their learning trajectory.
    """
    message_history: List[str] = dspy.InputField(desc="The recent history of the conversation.")
    student_message: str = dspy.InputField(desc="The latest message from the student.")
    
    # Use the Pydantic model to enforce structured output
    analysis: AnalysisResult = dspy.OutputField(desc="The structured analysis of the student's message.")

# Define the DSPy Module that performs the analysis
class MessageAnalyzer(dspy.Module):
    def __init__(self):
        super().__init__()
        # ChainOfThought allows the model to "think" before providing a final answer,
        # leading to more accurate classification and extraction.
        self.analyzer = dspy.ChainOfThought(AnalyzeStudentMessage)

    def forward(self, student_message, message_history):
        # Format the message history for the prompt
        formatted_history = "\n".join(message_history)
        
        # Run the analyzer
        result = self.analyzer(student_message=student_message, message_history=formatted_history)
        
        return result.analysis
