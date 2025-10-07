// store/useFavoriteStore.ts
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie } from '@/types/movie';

interface FavoriteState {
  favorites: Movie[];
  addFavorite: (movie: Movie) => void;
  removeFavorite: (movieId: number) => void;
  isFavorite: (movieId: number) => boolean;
  clearFavorites: () => void;
  getFavoritesByGenre: (genre: string) => Movie[];
  getFavoriteCount: () => number;
}

export const useFavoriteStore = create<FavoriteState>()(
  devtools(
    persist(
      (set, get) => ({
        favorites: [],

        addFavorite: (movie: Movie) =>
          set(
            (state) => {
              const exists = state.favorites.find((m) => m.id === movie.id);
              if (exists) return state;
              return { favorites: [...state.favorites, movie] };
            },
            false,
            'favorite/addFavorite'
          ),

        removeFavorite: (movieId: number) =>
          set(
            (state) => ({
              favorites: state.favorites.filter((movie) => movie.id !== movieId),
            }),
            false,
            'favorite/removeFavorite'
          ),

        isFavorite: (movieId: number) =>
          get().favorites.some((movie) => movie.id === movieId),

        clearFavorites: () =>
          set({ favorites: [] }, false, 'favorite/clearFavorites'),

        getFavoritesByGenre: (genre: string) =>
          get().favorites.filter((movie) =>
            movie.genre.some((g) => g.toLowerCase().includes(genre.toLowerCase()))
          ),

        getFavoriteCount: () => get().favorites.length,
      }),
      {
        name: 'favorites-storage',
        storage: createJSONStorage(() => AsyncStorage),
      }
    ),
    {
      name: 'favorite-store',
    }
  )
);

export const useFavorites = () => useFavoriteStore((state) => state.favorites);
export const useIsFavorite = (movieId: number) =>
  useFavoriteStore((state) => state.isFavorite(movieId));
