import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Movie, MovieRecommendation, Language } from '@/types';

interface MovieState {
  movies: Movie[];
  recommendations: MovieRecommendation[];
  selectedLanguages: string[];
  selectedGenres: string[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setMovies: (movies: Movie[]) => void;
  setRecommendations: (recommendations: MovieRecommendation[]) => void;
  setSelectedLanguages: (languages: string[]) => void;
  setSelectedGenres: (genres: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addMovie: (movie: Movie) => void;
  removeMovie: (movieId: number) => void;
  clearRecommendations: () => void;
}

export const useMovieStore = create<MovieState>()(
  devtools(
    (set) => ({
      movies: [],
      recommendations: [],
      selectedLanguages: ['English'],
      selectedGenres: [],
      isLoading: false,
      error: null,

      setMovies: (movies: Movie[]) =>
        set(
          { movies },
          false,
          'movie/setMovies'
        ),

      setRecommendations: (recommendations: MovieRecommendation[]) =>
        set(
          { recommendations },
          false,
          'movie/setRecommendations'
        ),

      setSelectedLanguages: (languages: string[]) =>
        set(
          { selectedLanguages: languages },
          false,
          'movie/setSelectedLanguages'
        ),

      setSelectedGenres: (genres: string[]) =>
        set(
          { selectedGenres: genres },
          false,
          'movie/setSelectedGenres'
        ),

      setLoading: (loading: boolean) =>
        set(
          { isLoading: loading },
          false,
          'movie/setLoading'
        ),

      setError: (error: string | null) =>
        set(
          { error },
          false,
          'movie/setError'
        ),

      addMovie: (movie: Movie) =>
        set(
          (state) => ({
            movies: [...state.movies, movie],
          }),
          false,
          'movie/addMovie'
        ),

      removeMovie: (movieId: number) =>
        set(
          (state) => ({
            movies: state.movies.filter((movie) => movie.id !== movieId),
          }),
          false,
          'movie/removeMovie'
        ),

      clearRecommendations: () =>
        set(
          { recommendations: [] },
          false,
          'movie/clearRecommendations'
        ),
    }),
    {
      name: 'movie-store',
    }
  )
);

// Selectors
export const useMovies = () => useMovieStore((state) => state.movies);
export const useRecommendations = () => useMovieStore((state) => state.recommendations);
export const useSelectedLanguages = () => useMovieStore((state) => state.selectedLanguages);
export const useSelectedGenres = () => useMovieStore((state) => state.selectedGenres);
export const useMovieLoading = () => useMovieStore((state) => state.isLoading);
export const useMovieError = () => useMovieStore((state) => state.error);
