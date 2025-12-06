import { courses } from '@/lib/mock-data';
import { QuizClient } from './_components/quiz-client';

interface QuizPageProps {
  params: Promise<{
    quizId: string;
  }>;
}

/**
 * Quiz Page - Server Component
 * 
 * This page follows the microservices architecture:
 * - It extracts route parameters and resolves course context
 * - QuizClient handles all quiz operations via the QuizService
 * - Data persistence flows through Firestore (emulator in dev)
 * 
 * URL Pattern: /student/assessments/[quizId]
 * - quizId can be an existing Firestore quiz ID
 * - quizId can be "new-{courseId}" to generate a new quiz for a course
 */
export default async function QuizPage({ params }: QuizPageProps) {
  const { quizId } = await params;
  
  // Determine context from quizId
  // Pattern: "new-{courseId}" for new quizzes, or existing Firestore document ID
  let courseId: string | null = null;
  let courseTitle = "Quiz";
  let isNewQuiz = false;

  if (quizId.startsWith('new-')) {
    // New quiz request: extract courseId from URL
    courseId = quizId.replace('new-', '');
    isNewQuiz = true;
  } else if (quizId.includes('-')) {
    // Legacy pattern: quiz-{courseId}-{timestamp}
    const parts = quizId.split('-');
    if (parts.length >= 2) {
      courseId = parts[1];
    }
  }

  // Try to get course title from mock data for display purposes
  // In production, QuizClient fetches this from Firestore via QuizService
  if (courseId) {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      courseTitle = course.title;
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Practice Quiz</h1>
        <p className="text-muted-foreground mt-2">
          Course: {courseTitle}
        </p>
      </div>

      <QuizClient 
        quizId={isNewQuiz ? '' : quizId}
        courseId={courseId || ''}
        courseTitle={courseTitle}
      />
    </div>
  );
}
