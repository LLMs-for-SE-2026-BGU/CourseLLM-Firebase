"""
DSPy Modules for Course Material RAG System
"""
import dspy
from typing import List, Dict, Optional
from .signatures import (
    GenerateAnswer,
    GenerateFollowUpQuestions,
    AssessUnderstanding,
    SocraticPrompt,
    SummarizeMaterial,
    GenerateQuizQuestions
)


class CourseMaterialRAG(dspy.Module):
    """
    RAG module for answering questions based on course materials.
    Uses Chain of Thought reasoning for better answers.
    """
    
    def __init__(self):
        super().__init__()
        self.generate_answer = dspy.ChainOfThought(GenerateAnswer)
    
    def forward(self, course_context: str, question: str) -> dspy.Prediction:
        """
        Generate an answer based on course material context.
        
        Args:
            course_context: Relevant course material content
            question: Student's question
            
        Returns:
            dspy.Prediction with answer field
        """
        return self.generate_answer(
            course_context=course_context,
            question=question
        )


class SocraticTeacher(dspy.Module):
    """
    Socratic teaching module that guides students with questions
    rather than direct answers.
    """
    
    def __init__(self):
        super().__init__()
        self.generate_socratic = dspy.ChainOfThought(SocraticPrompt)
        self.generate_answer = dspy.ChainOfThought(GenerateAnswer)
    
    def forward(
        self,
        course_material: str,
        student_question: str,
        mode: str = "socratic"
    ) -> dspy.Prediction:
        """
        Respond to student question with Socratic method or direct answer.
        
        Args:
            course_material: Course material context
            student_question: Student's question
            mode: 'socratic' for guiding questions, 'direct' for answers
            
        Returns:
            dspy.Prediction with response
        """
        if mode == "socratic":
            return self.generate_socratic(
                course_material=course_material,
                student_question=student_question
            )
        else:
            return self.generate_answer(
                course_context=course_material,
                question=student_question
            )


class StudentAssessment(dspy.Module):
    """
    Module for assessing student understanding and providing feedback.
    """
    
    def __init__(self):
        super().__init__()
        self.assess = dspy.ChainOfThought(AssessUnderstanding)
        self.follow_up = dspy.Predict(GenerateFollowUpQuestions)
    
    def forward(
        self,
        question: str,
        student_answer: str,
        correct_answer: str,
        topic: str
    ) -> Dict:
        """
        Assess student answer and generate follow-up questions.
        
        Args:
            question: Original question
            student_answer: Student's answer
            correct_answer: Expected answer
            topic: Topic being assessed
            
        Returns:
            Dict with assessment, understanding_level, and follow_up_questions
        """
        # Assess the answer
        assessment_result = self.assess(
            question=question,
            student_answer=student_answer,
            correct_answer=correct_answer
        )
        
        # Generate follow-up questions if needed
        follow_ups = None
        if assessment_result.understanding_level in ["partial", "needs_improvement"]:
            follow_ups = self.follow_up(
                topic=topic,
                previous_qa=f"Q: {question}\nA: {student_answer}"
            )
        
        return {
            "assessment": assessment_result.assessment,
            "understanding_level": assessment_result.understanding_level,
            "follow_up_questions": follow_ups.follow_up_questions if follow_ups else []
        }


class MaterialSummarizer(dspy.Module):
    """
    Module for summarizing course materials.
    """
    
    def __init__(self):
        super().__init__()
        self.summarize = dspy.ChainOfThought(SummarizeMaterial)
    
    def forward(self, material_content: str) -> dspy.Prediction:
        """
        Summarize course material content.
        
        Args:
            material_content: Full course material text
            
        Returns:
            dspy.Prediction with summary and key_points
        """
        return self.summarize(material_content=material_content)


class QuizGenerator(dspy.Module):
    """
    Module for generating quiz questions from course materials.
    """
    
    def __init__(self):
        super().__init__()
        self.generate_quiz = dspy.ChainOfThought(GenerateQuizQuestions)
    
    def forward(
        self,
        material_content: str,
        difficulty: str = "medium",
        num_questions: int = 5
    ) -> dspy.Prediction:
        """
        Generate quiz questions from course material.
        
        Args:
            material_content: Course material content
            difficulty: Question difficulty level
            num_questions: Number of questions to generate
            
        Returns:
            dspy.Prediction with questions list
        """
        return self.generate_quiz(
            material_content=material_content,
            difficulty=difficulty,
            num_questions=num_questions
        )


class PersonalizedLearningAssistant(dspy.Module):
    """
    Comprehensive module that combines RAG, assessment, and adaptive learning.
    """
    
    def __init__(self):
        super().__init__()
        self.rag = CourseMaterialRAG()
        self.socratic = SocraticTeacher()
        self.assessor = StudentAssessment()
        self.summarizer = MaterialSummarizer()
    
    def answer_question(
        self,
        course_materials: List[str],
        question: str,
        use_socratic: bool = False
    ) -> Dict:
        """
        Answer student question using course materials.
        
        Args:
            course_materials: List of relevant course material texts
            question: Student's question
            use_socratic: Use Socratic method instead of direct answer
            
        Returns:
            Dict with answer/response and metadata
        """
        # Combine course materials
        combined_context = "\n\n".join(course_materials)
        
        if use_socratic:
            result = self.socratic(
                course_material=combined_context,
                student_question=question,
                mode="socratic"
            )
            return {
                "response": result.socratic_response,
                "type": "socratic"
            }
        else:
            result = self.rag(
                course_context=combined_context,
                question=question
            )
            return {
                "response": result.answer,
                "type": "direct"
            }
    
    def assess_and_provide_feedback(
        self,
        question: str,
        student_answer: str,
        correct_answer: str,
        topic: str
    ) -> Dict:
        """
        Assess student answer and provide personalized feedback.
        """
        return self.assessor(
            question=question,
            student_answer=student_answer,
            correct_answer=correct_answer,
            topic=topic
        )
    
    def summarize_materials(self, materials: List[str]) -> Dict:
        """
        Summarize course materials for quick review.
        """
        combined = "\n\n".join(materials)
        result = self.summarizer(material_content=combined)
        
        return {
            "summary": result.summary,
            "key_points": result.key_points
        }
