// types/puzzle.ts
export interface PuzzleQuestion {
  id: string;
  type: 'multiple-choice' | 'slider' | 'image-selection' | 'scenario' | 'rating';
  question: string;
  description?: string;
  options?: PuzzleOption[];
  minValue?: number;
  maxValue?: number;
  images?: string[];
  scenario?: string;
  moodWeights: Record<string, number>;
}

export interface PuzzleOption {
  id: string;
  text: string;
  value: number;
  image?: string;
  emoji?: string;
}

export interface PuzzleResponse {
  questionId: string;
  response: string | number;
  timestamp: number;
}

export interface PuzzleSession {
  id: string;
  startTime: number;
  responses: PuzzleResponse[];
  isCompleted: boolean;
  moodAnalysis?: MoodAnalysis;
}

export interface PuzzleCategory {
  id: string;
  name: string;
  description: string;
  emoji: string;
  questions: PuzzleQuestion[];
}

export type PuzzleType = 'color' | 'music' | 'scenario' | 'image' | 'weather' | 'activity';
