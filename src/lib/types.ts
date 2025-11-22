export type Material = {
  id: string;
  title: string;
  type: 'PDF' | 'PPT' | 'DOC' | 'MD';
  content: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  imageId: string;
  materials: Material[];
  learningObjectives: string;
  learningSkills: string;
  learningTrajectories: string;
};

export type Student = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type StudentProgress = {
  studentId: string;
  courseId: string;
  progress: number;
  questionsAsked: number;
  lastAccessed: string;
};

export type EngagementData = {
  date: string;
  logins: number;
  questions: number;
};

export type Quiz = {
  id: string;
  title: string;
  courseId: string;
  score: number;
  totalQuestions: number;
  dateTaken: string;
  status: 'completed' | 'pending';
};

export type LearningObjective = {
  id: string;
  description: string;
  courseId: string;
  status: 'mastered' | 'in-progress' | 'not-started';
  progress: number;
};

export type QuizQuestion = {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  learningObjectiveId?: string; // Link to a specific LO
  explanation?: string; // For feedback
};

export type QuizAttemptResult = {
  quizId: string;
  score: number;
  totalQuestions: number;
  feedback: string;
  questionResults: {
    questionId: string;
    isCorrect: boolean;
    studentAnswerIndex: number;
    correctAnswerIndex: number;
    explanation: string;
  }[];
  loUpdates: {
    loId: string;
    delta: number; // Change in progress
  }[];
};