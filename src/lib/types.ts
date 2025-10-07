
export interface Question {
  id?: string; 
  section: 'listening' | 'reading' | 'structure';
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  questionText?: string;
  audioSrc?: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
  explanation?: string; 
  explanationVideoUrl?: string;
}

export interface TestAttempt {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  timeTaken: number; // in seconds
  sections: {
    listening: { score: number; total: number };
    reading: { score: number; total: number };
    structure: { score: number; total: number };
  };
}

export interface UserProgress {
  history: TestAttempt[];
}

export type Section = 'listening' | 'reading' | 'structure';

export type UserAnswerForReview = {
  question: Question;
  selectedOptionId: string | null;
  isCorrect: boolean;
};

// This type represents the structure of the `Result` document in Firestore.
export interface Result {
  id?: string;
  sessionId: string;
  userId: string;
  scores: any[]; // Simplified for now
  totalScore: number;
  questionCount: number;
  type: 'practice' | 'training';
  testName: string;
  globalCefrLevel: string;
  createdAt: string; // ISO date string
  validUntil: string; // ISO date string
  answers: UserAnswerForReview[];
}
