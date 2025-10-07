// store/useSettingsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, AppSettings } from '@/types';

interface SettingsStore {
  profile: UserProfile;
  settings: AppSettings;
  
  // Profile actions
  updateProfile: (updates: Partial<UserProfile>) => void;
  resetProfile: () => void;
  
  // Settings actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
  
  // Computed
  isProfileComplete: () => boolean;
  getAgeRating: () => string;
}

const defaultProfile: UserProfile = {
  name: '',
  age: 18,
  favoriteGenres: [],
  preferredLanguages: ['en'],
  contentRating: 'PG-13',
  avatar: '',
  bio: '',
  country: '',
};

const defaultSettings: AppSettings = {
  theme: 'auto',
  language: 'en',
  notifications: true,
  autoPlay: false,
  dataUsage: 'medium',
  cacheSize: 100,
  version: '1.0.0',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      settings: defaultSettings,

      updateProfile: (updates) => {
        set((state) => ({
          profile: { 
            ...state.profile, 
            ...updates,
            updatedAt: new Date()
          }
        }));
      },

      resetProfile: () => {
        set({ profile: { ...defaultProfile, createdAt: new Date() } });
      },

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates }
        }));
      },

      resetSettings: () => {
        set({ settings: defaultSettings });
      },

      isProfileComplete: () => {
        const { profile } = get();
        return !!(
          profile.name?.trim() &&
          profile.age >= 13 &&
          profile.favoriteGenres.length > 0
        );
      },

      getAgeRating: () => {
        const { profile } = get();
        if (profile.age < 13) return 'G';
        if (profile.age < 17) return 'PG-13';
        return 'R';
      },
    }),
    {
      name: 'settings-store',
      storage: {
        getItem: async (name: string) => {
          try {
            const value = await AsyncStorage.getItem(name);
            return value ? JSON.parse(value) : null;
          } catch (error) {
            console.error('Error loading settings store:', error);
            return null;
          }
        },
        setItem: async (name: string, value: any) => {
          try {
            await AsyncStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            console.error('Error saving settings store:', error);
          }
        },
        removeItem: async (name: string) => {
          try {
            await AsyncStorage.removeItem(name);
          } catch (error) {
            console.error('Error removing settings store:', error);
          }
        },
      },
    }
  )
);
