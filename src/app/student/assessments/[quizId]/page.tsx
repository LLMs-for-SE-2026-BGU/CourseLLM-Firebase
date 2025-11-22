import { quizzes, courses, learningObjectives } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { QuizClient } from './_components/quiz-client';
import { Quiz } from '@/lib/types';

interface QuizPageProps {
  params: Promise<{
    quizId: string;
  }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { quizId } = await params;
  
  // Find the quiz
  // First check static mock data
  let quiz = quizzes.find(q => q.id === quizId);

  // If not found, it might be a new quiz (simulated by returning a default structure if ID matches pattern)
  // In a real app, this would fetch from DB. Here we construct a temporary quiz object 
  // because the client component will use the courseId to generate questions anyway.
  if (!quiz && quizId.startsWith('quiz-')) {
     // We don't know the course ID here easily without passing it in URL or having persistence on server.
     // For this hybrid mock setup, we'll try to infer or fallback. 
     // Actually, the Client Component generates questions based on course title.
     // We need the course info. 
     
     // LIMITATION: Since this is a server component and we used localStorage for 'newQuizzes',
     // the server cannot see the new quiz. 
     // SOLUTION: We will handle this gracefully. 
     // In a real DB, we would just fetch(quizId).
     
     // For this demo, if we can't find it in mock-data, we'll error unless we assume a default context
     // OR we can make the QuizPage client-side fetching for this mock scenario?
     // No, better to keep Server Component pattern.
     
     // To make this work with the "Create Quiz" feature (Client-side storage) + Server Component (Page):
     // We'll cheat slightly: We'll iterate all courses to find if any matches (not possible without stored data).
     
     // BETTER APPROACH: Since we can't read localStorage here, we will pass the logic to the client 
     // if it's not in the static list, OR we assume it's valid and let the client handle the "Not Found" 
     // if it can't find it in its own storage.
     
     // However, we need 'course' props for the client.
     // Let's handle 'new' quizzes by checking if the ID was passed with a course param? No.
     
     // Workaround for Mock E2E:
     // We will assume the quiz exists if it starts with 'quiz-', but we need to know which course.
     // We can't know. 
     
     // REFACTOR: We will update the 'Create Quiz' to include courseId in the URL or query param? 
     // No, clean URLs are better.
     
     // Let's return a "Loading/Hydration" state wrapper that lets the client read the quiz details 
     // from localStorage if not found on server?
  }
  
  if (!quiz) {
      // Fallback: Render a client-side wrapper that checks localStorage
      // This is complex.
      
      // Simple fix for Mock Data limit:
      // When creating a quiz, we'll assume it works for ANY course? No.
      
      // Let's accept that for this specific "Create Quiz" mock feature, 
      // the user will be redirected to a URL. 
      // We can encode the courseID in the ID? e.g. "quiz-cs101-timestamp"
      
      const parts = quizId.split('-');
      if (parts.length >= 3) {
          const courseId = parts[1]; // e.g. quiz-cs101-123456
          const course = courses.find(c => c.id === courseId);
          if (course) {
             quiz = {
                 id: quizId,
                 title: `Practice: ${course.title}`,
                 courseId: course.id,
                 score: 0,
                 totalQuestions: 5,
                 dateTaken: '',
                 status: 'pending'
             };
          }
      }
  }

  if (!quiz) {
    return <div>Quiz not found.</div>;
  }

  // Find the course
  const course = courses.find(c => c.id === quiz.courseId);
  
  if (!course) {
    return <div>Error: Course not found for this quiz.</div>;
  }

  // Find relevant Learning Objectives
  const relevantLOs = learningObjectives.filter(lo => lo.courseId === course.id);
  
  // Prepare props for the client
  const loDescriptions = relevantLOs.map(lo => lo.description);
  const loIds = relevantLOs.map(lo => lo.id);

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{quiz.title}</h1>
        <p className="text-muted-foreground mt-2">
          Course: {course.title} • {relevantLOs.length} Learning Objectives
        </p>
      </div>

      <QuizClient 
        quizId={quizId}
        courseTitle={course.title}
        learningObjectives={loDescriptions}
        loIds={loIds}
      />
    </div>
  );
}
