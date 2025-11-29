"""
DSPy Signatures for Course Material Q&A System
"""
import dspy
from typing import List


class GenerateAnswer(dspy.Signature):
    """Generate an answer to a student's question based on course materials."""
    
    course_context: str = dspy.InputField(
        desc="Relevant course material content and context"
    )
    question: str = dspy.InputField(
        desc="The student's question about the course material"
    )
    answer: str = dspy.OutputField(
        desc="A clear, educational answer that references the course material"
    )


class GenerateFollowUpQuestions(dspy.Signature):
    """Generate follow-up questions to deepen student understanding."""
    
    topic: str = dspy.InputField(
        desc="The topic being discussed"
    )
    previous_qa: str = dspy.InputField(
        desc="Previous question and answer context"
    )
    follow_up_questions: List[str] = dspy.OutputField(
        desc="3-5 thought-provoking follow-up questions"
    )


class AssessUnderstanding(dspy.Signature):
    """Assess student understanding based on their response."""
    
    question: str = dspy.InputField(
        desc="The original question asked"
    )
    student_answer: str = dspy.InputField(
        desc="The student's answer or response"
    )
    correct_answer: str = dspy.InputField(
        desc="The correct or expected answer"
    )
    assessment: str = dspy.OutputField(
        desc="Assessment of student understanding with constructive feedback"
    )
    understanding_level: str = dspy.OutputField(
        desc="Level: 'excellent', 'good', 'partial', or 'needs_improvement'"
    )


class SocraticPrompt(dspy.Signature):
    """Generate Socratic questions to guide student learning."""
    
    course_material: str = dspy.InputField(
        desc="Course material context"
    )
    student_question: str = dspy.InputField(
        desc="The student's initial question"
    )
    socratic_response: str = dspy.OutputField(
        desc="A Socratic question that guides the student to discover the answer themselves"
    )


class SummarizeMaterial(dspy.Signature):
    """Summarize course material for quick review."""
    
    material_content: str = dspy.InputField(
        desc="Full course material content"
    )
    summary: str = dspy.OutputField(
        desc="Concise summary highlighting key concepts and takeaways"
    )
    key_points: List[str] = dspy.OutputField(
        desc="3-5 key points or learning objectives"
    )


class GenerateQuizQuestions(dspy.Signature):
    """Generate quiz questions from course materials."""
    
    material_content: str = dspy.InputField(
        desc="Course material to generate questions from"
    )
    difficulty: str = dspy.InputField(
        desc="Difficulty level: 'easy', 'medium', or 'hard'"
    )
    num_questions: int = dspy.InputField(
        desc="Number of questions to generate"
    )
    questions: List[dict] = dspy.OutputField(
        desc="List of questions with format: {question, options, correct_answer, explanation}"
    )
