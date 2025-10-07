import type { Question } from '@/lib/types';
import questionsData from './questions.json';

// The JSON data is directly used as the seed questions.
// We cast it to the appropriate type to ensure compatibility.
export const seedQuestions: Omit<Question, 'id'>[] = questionsData as Omit<Question, 'id'>[];
