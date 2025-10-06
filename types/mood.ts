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

export interface MoodCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  movieGenres: string[];
}

export interface MoodAnalysis {
  primaryMood: string;
  secondaryMood?: string;
  scores: MoodScore;
  confidence: number;
  description: string;
}

export interface UserMoodHistory {
  id: string;
  timestamp: Date;
  analysis: MoodAnalysis;
  movieRecommendations: string[];
}
