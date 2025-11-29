'use server';

/**
 * Server actions for DSPy integration
 * These call the Python DSPy API service
 */

const DSPY_API_URL = process.env.DSPY_API_URL || 'http://localhost:8001';

interface QuestionRequest {
  courseMaterials: string[];
  question: string;
  useSocratic?: boolean;
}

interface QuestionResponse {
  response: string;
  type: 'direct' | 'socratic';
}

interface AssessmentRequest {
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  topic: string;
}

interface AssessmentResponse {
  assessment: string;
  understandingLevel: 'excellent' | 'good' | 'partial' | 'needs_improvement';
  followUpQuestions: string[];
}

interface SummarizeRequest {
  materials: string[];
}

interface SummarizeResponse {
  summary: string;
  keyPoints: string[];
}

/**
 * Ask a question about course materials using DSPy RAG
 */
export async function askCourseMaterialQuestion(
  courseMaterials: string[],
  question: string,
  useSocratic: boolean = false
): Promise<{ success: boolean; data?: QuestionResponse; error?: string }> {
  try {
    const response = await fetch(`${DSPY_API_URL}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        course_materials: courseMaterials,
        question: question,
        use_socratic: useSocratic,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.detail || 'Failed to get answer from DSPy service',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error calling DSPy API:', error);
    return {
      success: false,
      error: 'Failed to connect to DSPy service. Make sure it is running on port 8001.',
    };
  }
}

/**
 * Assess student's answer and get feedback
 */
export async function assessStudentAnswer(
  request: AssessmentRequest
): Promise<{ success: boolean; data?: AssessmentResponse; error?: string }> {
  try {
    const response = await fetch(`${DSPY_API_URL}/assess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: request.question,
        student_answer: request.studentAnswer,
        correct_answer: request.correctAnswer,
        topic: request.topic,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.detail || 'Failed to assess answer',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        assessment: data.assessment,
        understandingLevel: data.understanding_level,
        followUpQuestions: data.follow_up_questions,
      },
    };
  } catch (error) {
    console.error('Error calling DSPy API:', error);
    return {
      success: false,
      error: 'Failed to connect to DSPy service.',
    };
  }
}

/**
 * Summarize course materials
 */
export async function summarizeCourseMaterials(
  materials: string[]
): Promise<{ success: boolean; data?: SummarizeResponse; error?: string }> {
  try {
    const response = await fetch(`${DSPY_API_URL}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        materials: materials,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.detail || 'Failed to summarize materials',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        summary: data.summary,
        keyPoints: data.key_points,
      },
    };
  } catch (error) {
    console.error('Error calling DSPy API:', error);
    return {
      success: false,
      error: 'Failed to connect to DSPy service.',
    };
  }
}

/**
 * Generate quiz questions from course material
 */
export async function generateQuiz(
  materialContent: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  numQuestions: number = 5
): Promise<{ success: boolean; questions?: any[]; error?: string }> {
  try {
    const response = await fetch(`${DSPY_API_URL}/quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        material_content: materialContent,
        difficulty: difficulty,
        num_questions: numQuestions,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.detail || 'Failed to generate quiz',
      };
    }

    const data = await response.json();
    return {
      success: true,
      questions: data.questions,
    };
  } catch (error) {
    console.error('Error calling DSPy API:', error);
    return {
      success: false,
      error: 'Failed to connect to DSPy service.',
    };
  }
}


