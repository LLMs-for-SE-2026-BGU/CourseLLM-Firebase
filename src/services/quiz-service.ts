'use server';

/**
 * Quiz Service - Microservice for Quiz Operations
 * 
 * This service handles:
 * - Quiz generation (via AI flow)
 * - Quiz submission and grading (via AI flow)
 * - Result persistence to Firestore
 * - Learning trajectory updates
 * 
 * All methods are server actions that can be called directly from client components.
 * Data flows through Firestore (emulator in development).
 */

import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, updateDoc, arrayUnion, collection, Timestamp, query, where, getDocs, addDoc } from "firebase/firestore";
import { generateQuizFlow, QuizGenerationInput } from "@/ai/flows/quiz-generation";
import { gradeQuizFlow, QuizGradingInput, QuizGradingOutput } from "@/ai/flows/quiz-grading";

/**
 * Generates a new quiz for a student based on a course.
 * Persists the generated quiz and returns the quiz ID.
 */
export async function generateQuiz(userId: string, courseId: string): Promise<string> {
  // 1. Fetch Course Details (Title) and Learning Objectives
  const courseRef = doc(db, "courses", courseId);
  const courseSnap = await getDoc(courseRef);
  
  if (!courseSnap.exists()) {
      throw new Error("Course not found");
  }
  const courseData = courseSnap.data();
  
  // Fetch LOs
  const loQuery = query(collection(db, "learningObjectives"), where("courseId", "==", courseId));
  const loSnap = await getDocs(loQuery);
  const learningObjectives = loSnap.docs.map(d => d.data().description);
  const loIds = loSnap.docs.map(d => d.id);

  // 2. Call AI Flow to Generate Quiz
  const input: QuizGenerationInput = {
      courseTitle: courseData.title,
      learningObjectives: learningObjectives,
      difficulty: 'medium',
      count: 5
  };
  
  const generatedQuiz = await generateQuizFlow(input);

  // 3. Save Generated Quiz to Firestore
  const quizData = {
      userId,
      courseId,
      title: `Practice: ${courseData.title}`,
      questions: generatedQuiz.questions,
      loIds: loIds,
      status: 'pending',
      createdAt: Timestamp.now(),
      totalQuestions: generatedQuiz.questions.length,
      score: 0
  };

  const quizRef = await addDoc(collection(db, "quizzes"), quizData);
  return quizRef.id;
}

/**
 * Submits a quiz for grading.
 * Calls the grading AI, saves the results, and updates user mastery.
 */
export async function submitQuiz(userId: string, quizId: string, studentAnswers: Record<number, number>): Promise<QuizGradingOutput> {
    // 1. Fetch the quiz from DB
    const quizRef = doc(db, "quizzes", quizId);
    const quizSnap = await getDoc(quizRef);
    
    if (!quizSnap.exists()) {
        throw new Error("Quiz not found");
    }
    
    const quizData = quizSnap.data();
    
    if (quizData.userId !== userId) {
        throw new Error("Unauthorized access to quiz");
    }

    // 2. Prepare input for Grading Flow
    const gradingInput: QuizGradingInput = {
        quizId,
        questions: quizData.questions.map((q: any, index: number) => ({
            questionId: `q-${index}`,
            text: q.text,
            correctAnswerIndex: q.correctAnswerIndex,
            studentAnswerIndex: studentAnswers[index] ?? -1,
            learningObjectiveId: quizData.loIds[q.learningObjectiveIndex]
        }))
    };

    // 3. Call Grading Flow
    const result = await gradeQuizFlow(gradingInput);

    // 4. Update Quiz with Results
    await updateDoc(quizRef, {
        status: 'completed',
        score: result.score,
        feedback: result.feedback,
        loUpdates: result.loUpdates,
        completedAt: Timestamp.now()
    });

    // 5. Save Result to User Profile
    await saveQuizResult(userId, quizId, result);

    // 6. Update Learning Trajectory
    await updateLearningTrajectory(userId, result.loUpdates);

    return result;
}

/**
 * Saves the result of a quiz to the user's profile (subcollection).
 */
export async function saveQuizResult(userId: string, quizId: string, result: QuizGradingOutput) {
  const resultRef = doc(db, "users", userId, "quizResults", quizId);
  
  await setDoc(resultRef, {
    score: result.score,
    totalQuestions: result.totalQuestions,
    feedback: result.feedback,
    loUpdates: result.loUpdates,
    dateTaken: Timestamp.now(),
    status: 'completed'
  });
}

/**
 * Updates the student's mastery of Learning Objectives.
 */
export async function updateLearningTrajectory(userId: string, loUpdates: { loId: string; delta: number; reasoning: string }[]) {
  const batchPromises = loUpdates.map(async (update) => {
    const skillRef = doc(db, "users", userId, "skills", update.loId);
    const skillDoc = await getDoc(skillRef);

    if (skillDoc.exists()) {
      const currentMastery = skillDoc.data().mastery || 0;
      const newMastery = Math.max(0, Math.min(100, currentMastery + update.delta));
      
      await updateDoc(skillRef, {
          mastery: newMastery,
          history: arrayUnion({
              delta: update.delta,
              reasoning: update.reasoning,
              date: Timestamp.now()
          }),
          lastUpdated: Timestamp.now()
      });
    } else {
      // Create new skill entry
      await setDoc(skillRef, {
          mastery: Math.max(0, update.delta),
          history: [{
              delta: update.delta,
              reasoning: update.reasoning,
              date: Timestamp.now()
          }],
          lastUpdated: Timestamp.now()
      });
    }
  });

  await Promise.all(batchPromises);
}

/**
 * Fetches a quiz by ID.
 */
export async function getQuiz(quizId: string) {
  const quizRef = doc(db, "quizzes", quizId);
  const snapshot = await getDoc(quizRef);
  
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }
  return null;
}

/**
 * Fetches all quizzes taken by a student.
 */
export async function getStudentQuizzes(userId: string) {
    const q = query(collection(db, "quizzes"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
