import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { PuzzleResponse, MoodAnalysis, MoodScore } from '@/types';

interface MoodState {
  puzzleResponses: PuzzleResponse[];
  currentMoodAnalysis: MoodAnalysis | null;
  isAnalyzing: boolean;
  
  // Actions
  addPuzzleResponse: (response: PuzzleResponse) => void;
  setMoodAnalysis: (analysis: MoodAnalysis) => void;
  setAnalyzing: (analyzing: boolean) => void;
  resetPuzzleData: () => void;
  calculateMoodScores: () => MoodScore;
}

export const useMoodStore = create<MoodState>()(
  devtools(
    (set, get) => ({
      puzzleResponses: [],
      currentMoodAnalysis: null,
      isAnalyzing: false,

      addPuzzleResponse: (response: PuzzleResponse) =>
        set(
          (state) => ({
            puzzleResponses: [...state.puzzleResponses, response],
          }),
          false,
          'mood/addPuzzleResponse'
        ),

      setMoodAnalysis: (analysis: MoodAnalysis) =>
        set(
          { currentMoodAnalysis: analysis },
          false,
          'mood/setMoodAnalysis'
        ),

      setAnalyzing: (analyzing: boolean) =>
        set(
          { isAnalyzing: analyzing },
          false,
          'mood/setAnalyzing'
        ),

      resetPuzzleData: () =>
        set(
          {
            puzzleResponses: [],
            currentMoodAnalysis: null,
            isAnalyzing: false,
          },
          false,
          'mood/resetPuzzleData'
        ),

      calculateMoodScores: (): MoodScore => {
        const responses = get().puzzleResponses;
        const scores: MoodScore = {
          energetic: 0,
          calm: 0,
          happy: 0,
          nostalgic: 0,
          excited: 0,
          thoughtful: 0,
          romantic: 0,
          anxious: 0,
        };

        // This is a simplified calculation - in reality, you'd import from puzzle data
        responses.forEach((response) => {
          // Add logic to extract mood scores from responses
          // This would reference the actual puzzle options and their mood_scores
        });

        return scores;
      },
    }),
    {
      name: 'mood-store',
    }
  )
);

// Selectors
export const usePuzzleResponses = () => useMoodStore((state) => state.puzzleResponses);
export const useCurrentMoodAnalysis = () => useMoodStore((state) => state.currentMoodAnalysis);
export const useIsAnalyzing = () => useMoodStore((state) => state.isAnalyzing);
