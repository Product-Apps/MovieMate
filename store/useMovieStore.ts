// store/useMovieStore.ts (Enhanced)
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie, MovieRecommendation } from '@/types/movie';

interface MovieStore {
  recommendations: MovieRecommendation[];
  searchResults: Movie[];
  recentlyViewed: Movie[];
  watchlist: Movie[];
  
  setRecommendations: (recommendations: MovieRecommendation[]) => void;
  setSearchResults: (results: Movie[]) => void;
  addToRecentlyViewed: (movie: Movie) => void;
  addToWatchlist: (movie: Movie) => void;
  removeFromWatchlist: (movieId: number) => void;
  clearRecommendations: () => void;
  clearSearchResults: () => void;
  clearRecentlyViewed: () => void;
  isInWatchlist: (movieId: number) => boolean;
}

export const useMovieStore = create<MovieStore>()(
  persist(
    (set, get) => ({
      recommendations: [],
      searchResults: [],
      recentlyViewed: [],
      watchlist: [],

      setRecommendations: (recommendations) => set({ recommendations }),
      
      setSearchResults: (results) => set({ searchResults: results }),

      addToRecentlyViewed: (movie) =>
        set((state) => {
          const filtered = state.recentlyViewed.filter(m => m.id !== movie.id);
          return {
            recentlyViewed: [movie, ...filtered].slice(0, 20), // Keep last 20
          };
        }),

      addToWatchlist: (movie) =>
        set((state) => {
          if (state.watchlist.some(m => m.id === movie.id)) {
            return state; // Already in watchlist
          }
          return {
            watchlist: [movie, ...state.watchlist],
          };
        }),

      removeFromWatchlist: (movieId) =>
        set((state) => ({
          watchlist: state.watchlist.filter(m => m.id !== movieId),
        })),

      clearRecommendations: () => set({ recommendations: [] }),
      
      clearSearchResults: () => set({ searchResults: [] }),
      
      clearRecentlyViewed: () => set({ recentlyViewed: [] }),

      isInWatchlist: (movieId) => {
        const { watchlist } = get();
        return watchlist.some(m => m.id === movieId);
      },
    }),
    {
      name: 'movie-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
