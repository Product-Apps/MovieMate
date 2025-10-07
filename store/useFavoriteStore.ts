// store/useFavoriteStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie } from '@/types/movie';

interface FavoriteStore {
  favorites: Movie[];
  
  // Actions
  addFavorite: (movie: Movie) => void;
  removeFavorite: (movieId: number) => void;
  toggleFavorite: (movie: Movie) => void;
  clearFavorites: () => void;
  
  // Computed
  isFavorite: (movieId: number) => boolean;
  getFavoritesByGenre: (genre: string) => Movie[];
  getFavoritesByYear: (year: number) => Movie[];
  getFavoriteCount: () => number;
  getRecentFavorites: (limit?: number) => Movie[];
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (movie: Movie) => {
        set((state) => {
          const isAlreadyFavorite = state.favorites.some(fav => fav.id === movie.id);
          if (isAlreadyFavorite) {
            return state;
          }
          return {
            favorites: [...state.favorites, { ...movie, dateAdded: new Date().toISOString() }]
          };
        });
      },

      removeFavorite: (movieId: number) => {
        set((state) => ({
          favorites: state.favorites.filter(movie => movie.id !== movieId)
        }));
      },

      toggleFavorite: (movie: Movie) => {
        const state = get();
        if (state.isFavorite(movie.id)) {
          state.removeFavorite(movie.id);
        } else {
          state.addFavorite(movie);
        }
      },

      clearFavorites: () => {
        set({ favorites: [] });
      },

      isFavorite: (movieId: number) => {
        const state = get();
        return state.favorites.some(movie => movie.id === movieId);
      },

      getFavoritesByGenre: (genre: string) => {
        const state = get();
        return state.favorites.filter(movie => 
          movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        );
      },

      getFavoritesByYear: (year: number) => {
        const state = get();
        return state.favorites.filter(movie => movie.year === year);
      },

      getFavoriteCount: () => {
        const state = get();
        return state.favorites.length;
      },

      getRecentFavorites: (limit = 5) => {
        const state = get();
        return state.favorites
          .sort((a, b) => {
            const dateA = (a as any).dateAdded || '1970-01-01';
            const dateB = (b as any).dateAdded || '1970-01-01';
            return new Date(dateB).getTime() - new Date(dateA).getTime();
          })
          .slice(0, limit);
      },
    }),
    {
      name: 'favorite-store',
      storage: {
        getItem: async (name: string) => {
          try {
            const value = await AsyncStorage.getItem(name);
            return value ? JSON.parse(value) : null;
          } catch (error) {
            console.error('Error loading favorite store:', error);
            return null;
          }
        },
        setItem: async (name: string, value: any) => {
          try {
            await AsyncStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            console.error('Error saving favorite store:', error);
          }
        },
        removeItem: async (name: string) => {
          try {
            await AsyncStorage.removeItem(name);
          } catch (error) {
            console.error('Error removing favorite store:', error);
          }
        },
      },
    }
  )
);
