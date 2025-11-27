import { config } from 'dotenv';
config({ path: '.env.local' });

import '@/ai/flows/personalized-learning-assessment.ts';
import '@/ai/flows/socratic-course-chat.ts';
import '@/ai/flows/optimized-indexing.ts';