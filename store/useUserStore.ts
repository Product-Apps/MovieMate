// store/useUserStore.ts
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { UserMoodHistory } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  userId: string | null;
  moodHistory: UserMoodHistory[];
  preferences: {
    favoriteGenres: string[];
    favoriteLanguages: string[];
    darkMode: boolean;
  };
  
  setUserId: (id: string) => void;
  addMoodHistory: (history: UserMoodHistory) => void;
  updatePreferences: (preferences: Partial<UserState['preferences']>) => void;
  clearUserData: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        userId: null,
        moodHistory: [],
        preferences: {
          favoriteGenres: [],
          favoriteLanguages: ['English'],
          darkMode: false,
        },

        setUserId: (id: string) =>
          set(
            { userId: id },
            false,
            'user/setUserId'
          ),

        addMoodHistory: (history: UserMoodHistory) =>
          set(
            (state) => ({
              moodHistory: [history, ...state.moodHistory].slice(0, 50),
            }),
            false,
            'user/addMoodHistory'
          ),

        updatePreferences: (newPreferences) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, ...newPreferences },
            }),
            false,
            'user/updatePreferences'
          ),

        clearUserData: () =>
          set(
            {
              userId: null,
              moodHistory: [],
              preferences: {
                favoriteGenres: [],
                favoriteLanguages: ['English'],
                darkMode: false,
              },
            },
            false,
            'user/clearUserData'
          ),
      }),
      {
        name: 'user-store',
        storage: createJSONStorage(() => AsyncStorage),
      }
    ),
    {
      name: 'user-store',
    }
  )
);

export const useUserId = () => useUserStore((state) => state.userId);
export const useMoodHistory = () => useUserStore((state) => state.moodHistory);
export const useUserPreferences = () => useUserStore((state) => state.preferences);