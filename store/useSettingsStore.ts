// store/useSettingsStore.ts
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

export interface UserProfile {
  name: string;
  gender: Gender;
  age: number;
  dateOfBirth?: string;
  country?: string;
  favoriteGenres: string[];
  favoriteLanguages: string[];
}

interface SettingsState {
  profile: UserProfile;
  darkMode: boolean;
  notifications: boolean;
  ageRestrictions: boolean;
  adultContent: boolean;
  
  updateProfile: (profile: Partial<UserProfile>) => void;
  setDarkMode: (enabled: boolean) => void;
  setNotifications: (enabled: boolean) => void;
  setAgeRestrictions: (enabled: boolean) => void;
  setAdultContent: (enabled: boolean) => void;
  resetSettings: () => void;
  getAgeRestrictedContent: () => boolean;
}

const defaultProfile: UserProfile = {
  name: '',
  gender: 'prefer-not-to-say',
  age: 18,
  favoriteGenres: [],
  favoriteLanguages: ['en'],
};

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set, get) => ({
        profile: defaultProfile,
        darkMode: false,
        notifications: true,
        ageRestrictions: true,
        adultContent: false,

        updateProfile: (profileUpdate: Partial<UserProfile>) =>
          set(
            (state) => ({
              profile: { ...state.profile, ...profileUpdate },
            }),
            false,
            'settings/updateProfile'
          ),

        setDarkMode: (enabled: boolean) =>
          set({ darkMode: enabled }, false, 'settings/setDarkMode'),

        setNotifications: (enabled: boolean) =>
          set({ notifications: enabled }, false, 'settings/setNotifications'),

        setAgeRestrictions: (enabled: boolean) =>
          set({ ageRestrictions: enabled }, false, 'settings/setAgeRestrictions'),

        setAdultContent: (enabled: boolean) =>
          set({ adultContent: enabled }, false, 'settings/setAdultContent'),

        resetSettings: () =>
          set(
            {
              profile: defaultProfile,
              darkMode: false,
              notifications: true,
              ageRestrictions: true,
              adultContent: false,
            },
            false,
            'settings/resetSettings'
          ),

        getAgeRestrictedContent: () => {
          const { profile, ageRestrictions, adultContent } = get();
          if (!ageRestrictions) return true;
          if (adultContent) return true;
          return profile.age >= 18;
        },
      }),
      {
        name: 'settings-storage',
        storage: createJSONStorage(() => AsyncStorage),
      }
    ),
    {
      name: 'settings-store',
    }
  )
);

export const useUserProfile = () => useSettingsStore((state) => state.profile);
export const useDarkMode = () => useSettingsStore((state) => state.darkMode);
