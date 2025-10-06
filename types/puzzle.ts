export interface PuzzleOption {
  id: string;
  text?: string;
  label?: string;
  colors?: string[];
  pattern?: string;
  symbol?: string;
  bpm?: number;
  description?: string;
  image?: string;
  mood_scores: Record<string, number>;
}

export interface PuzzleQuestion {
  id: number;
  type: 'color_harmony' | 'pattern_completion' | 'story_context' | 'rhythm_matching' | 'image_association';
  title: string;
  description: string;
  options: PuzzleOption[];
  scenarios?: PuzzleScenario[];
  pairs?: PuzzlePair[];
}

export interface PuzzleScenario {
  id: string;
  text: string;
  options: PuzzleOption[];
}

export interface PuzzlePair {
  id: string;
  option_a: {
    image: string;
    mood_scores: Record<string, number>;
  };
  option_b: {
    image: string;
    mood_scores: Record<string, number>;
  };
}

export interface PuzzleResponse {
  puzzleId: number;
  selectedOption: string;
  responseTime: number;
  timestamp: Date;
}

export interface PuzzleState {
  currentPuzzleIndex: number;
  responses: PuzzleResponse[];
  isCompleted: boolean;
  startTime: Date | null;
}
