'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuizGenerationInputSchema = z.object({
  courseTitle: z.string(),
  learningObjectives: z.array(z.string()),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  count: z.number().default(5),
});

export type QuizGenerationInput = z.infer<typeof QuizGenerationInputSchema>;

const GeneratedQuestionSchema = z.object({
  text: z.string(),
  options: z.array(z.string()),
  correctAnswerIndex: z.number(),
  learningObjectiveIndex: z.number().describe('The index of the input learning objective this question tests'),
  explanation: z.string(),
});

const QuizGenerationOutputSchema = z.object({
  questions: z.array(GeneratedQuestionSchema),
});

export type QuizGenerationOutput = z.infer<typeof QuizGenerationOutputSchema>;

const quizGenerationPrompt = ai.definePrompt({
  name: 'quizGenerationPrompt',
  input: { schema: QuizGenerationInputSchema },
  output: { schema: QuizGenerationOutputSchema },
  prompt: `You are an expert curriculum developer. Generate a multiple-choice quiz for the course "{{{courseTitle}}}".
  
  Target Learning Objectives:
  {{#each learningObjectives}}
  - {{this}}
  {{/each}}
  
  Difficulty: {{{difficulty}}}
  Number of Questions: {{{count}}}
  
  Create questions that test understanding of these specific objectives. 
  Ensure options are plausible but only one is clearly correct.
  Provide an explanation for the correct answer.
  Indicate which Learning Objective (by index, 0-based) each question primarily targets.`,
});

export const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: QuizGenerationInputSchema,
    outputSchema: QuizGenerationOutputSchema,
  },
  async (input) => {
    const { output } = await quizGenerationPrompt(input);
    return output!;
  }
);

