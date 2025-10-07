// types/mood.ts
export interface MoodAnalysis {
  primaryMood: MoodType;
  secondaryMoods: MoodType[];
  confidence: number;
  tags: string[];
  energy: number;
  valence: number;
  arousal: number;
}

export type MoodType = 
  | 'happy'
  | 'sad'
  | 'excited'
  | 'calm'
  | 'anxious'
  | 'romantic'
  | 'nostalgic'
  | 'adventurous'
  | 'mysterious'
  | 'thoughtful'
  | 'energetic'
  | 'melancholic'
  | 'optimistic'
  | 'contemplative';

export interface PuzzleResponse {
  questionId: string;
  response: string | number;
  timestamp: number;
}

export interface MoodPuzzleState {
  responses: PuzzleResponse[];
  currentMoodAnalysis: MoodAnalysis | null;
  completionPercentage: number;
  isAnalyzing: boolean;
}

export interface MoodMapping {
  mood: MoodType;
  genres: string[];
  keywords: string[];
  weight: number;
}
