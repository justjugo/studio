export interface Question {
  id?: number; // Made id optional as it's not in the JSON for local usage
  section: 'listening' | 'reading' | 'structure';
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  questionText?: string;
  audioSrc?: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
  explanation?: string; // made explanation optional
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
