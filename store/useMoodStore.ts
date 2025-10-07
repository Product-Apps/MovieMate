// store/useMoodStore.ts (Enhanced)
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodType } from '@/types/mood';

export interface MoodAnalysis {
  primaryMood: MoodType;
  secondaryMoods: MoodType[];
  confidence: number;
  tags: string[];
  energy: number;
  valence: number;
  arousal: number;
  timestamp: number;
  movieRecommendations?: any[];
}

export interface PuzzleResponse {
  questionId: string;
  response: any;
  timestamp: number;
}

interface MoodStore {
  currentMoodAnalysis: MoodAnalysis | null;
  moodHistory: MoodAnalysis[];
  responses: PuzzleResponse[];
  isAnalyzing: boolean;
  completionPercentage: number;
  setMoodAnalysis: (analysis: MoodAnalysis) => void;
  addToMoodHistory: (analysis: MoodAnalysis) => void;
  addResponse: (response: PuzzleResponse) => void;
  setAnalyzing: (analyzing: boolean) => void;
  updateCompletionPercentage: (percentage: number) => void;
  resetPuzzleData: () => void;
  clearMoodHistory: () => void;
  getMoodTrends: () => any;
}

export const useMoodStore = create<MoodStore>()(
  persist(
    (set, get) => ({
      currentMoodAnalysis: null,
      moodHistory: [],
      responses: [],
      isAnalyzing: false,
      completionPercentage: 0,

      setMoodAnalysis: (analysis) => {
        const enhancedAnalysis = {
          ...analysis,
          timestamp: Date.now(),
        };
        
        set((state) => ({
          currentMoodAnalysis: enhancedAnalysis,
          moodHistory: [enhancedAnalysis, ...state.moodHistory.slice(0, 49)], // Keep last 50
        }));
      },

      addToMoodHistory: (analysis) =>
        set((state) => ({
          moodHistory: [analysis, ...state.moodHistory.slice(0, 49)],
        })),

      addResponse: (response) =>
        set((state) => ({
          responses: [...state.responses, response],
        })),

      setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),

      updateCompletionPercentage: (percentage) =>
        set({ completionPercentage: percentage }),

      resetPuzzleData: () =>
        set({
          responses: [],
          completionPercentage: 0,
          currentMoodAnalysis: null,
        }),

      clearMoodHistory: () => set({ moodHistory: [] }),

      getMoodTrends: () => {
        const { moodHistory } = get();
        const last30Days = moodHistory.filter(
          (entry) => Date.now() - entry.timestamp < 30 * 24 * 60 * 60 * 1000
        );

        const moodCounts: { [key in MoodType]?: number } = {};
        last30Days.forEach((entry) => {
          moodCounts[entry.primaryMood] =
            (moodCounts[entry.primaryMood] || 0) + 1;
        });

        return {
          totalEntries: last30Days.length,
          dominantMood: Object.keys(moodCounts).reduce((a, b) =>
            (moodCounts[a as MoodType] ?? 0) >
            (moodCounts[b as MoodType] ?? 0)
              ? a
              : b
          ),
          moodDistribution: moodCounts,
          averageConfidence:
            last30Days.reduce((sum, entry) => sum + entry.confidence, 0) /
            last30Days.length,
        };
      },
    }),
    {
      name: 'mood-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
