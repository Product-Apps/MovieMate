// types/index.ts (Complete types file)
export interface PuzzleResponse {
  puzzleId: string;
  selectedOption: any;
  timestamp: Date;
}

export interface MoodAnalysis {
  primaryMood: string;
  secondaryMood?: string;
  confidence: number;
  description: string;
  timestamp: Date;
}

export interface MoodScore {
  energetic: number;    
  calm: number;
  happy: number;
  nostalgic: number;
  excited: number;
  thoughtful: number;
  romantic: number;
  anxious: number;
}

export * from './movie';
export * from './puzzle';
