'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionResultInputSchema = z.object({
  questionId: z.string(),
  text: z.string(),
  correctAnswerIndex: z.number(),
  studentAnswerIndex: z.number(),
  learningObjectiveId: z.string().optional(),
});

const QuizGradingInputSchema = z.object({
  quizId: z.string(),
  questions: z.array(QuestionResultInputSchema),
});

export type QuizGradingInput = z.infer<typeof QuizGradingInputSchema>;

const LOUpdateSchema = z.object({
  loId: z.string(),
  delta: z.number().describe('Percentage point change (e.g., +10, -5) based on performance'),
  reasoning: z.string(),
});

const QuizGradingOutputSchema = z.object({
  score: z.number(),
  totalQuestions: z.number(),
  feedback: z.string().describe('Overall feedback for the student'),
  loUpdates: z.array(LOUpdateSchema),
});

export type QuizGradingOutput = z.infer<typeof QuizGradingOutputSchema>;

const quizGradingPrompt = ai.definePrompt({
  name: 'quizGradingPrompt',
  input: { schema: QuizGradingInputSchema },
  output: { schema: QuizGradingOutputSchema },
  prompt: `You are an AI tutor grading a student quiz.
  
  Quiz ID: {{{quizId}}}
  
  Student Answers:
  {{#each questions}}
  - Question: {{text}}
    - Correct Index: {{correctAnswerIndex}}
    - Student Index: {{studentAnswerIndex}}
    - LO ID: {{learningObjectiveId}}
  {{/each}}
  
  Task:
  1. Calculate the score (number correct).
  2. Provide encouraging but constructive overall feedback.
  3. Determine how the student's mastery of linked Learning Objectives (LOs) should change.
     - If they answered correctly, increase mastery (e.g., +10 to +20).
     - If incorrect, decrease slightly or keep same (e.g., -5 or 0).
  `,
});

export const gradeQuizFlow = ai.defineFlow(
  {
    name: 'gradeQuizFlow',
    inputSchema: QuizGradingInputSchema,
    outputSchema: QuizGradingOutputSchema,
  },
  async (input) => {
    const { output } = await quizGradingPrompt(input);
    return output!;
  }
);

