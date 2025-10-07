// services/tmdbService.ts
import axios from 'axios';
import { TMDBMovie, TMDBResponse, Movie, Genre } from '@/types/movie';

const TMDB_API_KEY = 'f5232e998e328f138f5c1ceafd73db6a'; // Replace with your actual API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const tmdbService = {
  getMoviesByGenreAndLanguage: async (genreId: number, language: string, page: number = 1): Promise<Movie[]> => {
    try {
      const response = await axios.get<TMDBResponse>(`${TMDB_BASE_URL}/discover/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'en-US',
          sort_by: 'popularity.desc',
          with_genres: genreId,
          with_original_language: language,
          page,
        },
      });
      return response.data.results.map(convertTMDBToMovie);
    } catch (error) {
      console.error('Error fetching movies by genre and language:', error);
      return [];
    }
  },
  searchMovies: async (query: string): Promise<Movie[]> => {
    try {
      const response = await axios.get<TMDBResponse>(`${TMDB_BASE_URL}/search/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          query,
          language: 'en-US',
          page: 1,
          include_adult: false,
        },
      });
      return response.data.results.map(convertTMDBToMovie);
    } catch (error) {
      console.error('Error searching movies:', error);
      return [];
    }
  },

  getPopularMovies: async (page: number = 1): Promise<Movie[]> => {
    try {
      const response = await axios.get<TMDBResponse>(`${TMDB_BASE_URL}/movie/popular`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'en-US',
          page,
        },
      });
      return response.data.results.map(convertTMDBToMovie);
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      return [];
    }
  },

  getTopRatedMovies: async (page: number = 1): Promise<Movie[]> => {
    try {
      const response = await axios.get<TMDBResponse>(`${TMDB_BASE_URL}/movie/top_rated`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'en-US',
          page,
        },
      });
      return response.data.results.map(convertTMDBToMovie);
    } catch (error) {
      console.error('Error fetching top rated movies:', error);
      return [];
    }
  },

  getMoviesByGenre: async (genreId: number, page: number = 1): Promise<Movie[]> => {
    try {
      const response = await axios.get<TMDBResponse>(`${TMDB_BASE_URL}/discover/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'en-US',
          sort_by: 'popularity.desc',
          with_genres: genreId,
          page,
        },
      });
      return response.data.results.map(convertTMDBToMovie);
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
      return [];
    }
  },

  getMovieDetails: async (movieId: number): Promise<Movie | null> => {
    try {
      const [movieResponse, creditsResponse, videosResponse] = await Promise.all([
        axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
          params: { api_key: TMDB_API_KEY, language: 'en-US' },
        }),
        axios.get(`${TMDB_BASE_URL}/movie/${movieId}/credits`, {
          params: { api_key: TMDB_API_KEY },
        }),
        axios.get(`${TMDB_BASE_URL}/movie/${movieId}/videos`, {
          params: { api_key: TMDB_API_KEY, language: 'en-US' },
        }),
      ]);

      const movie = movieResponse.data;
      const credits = creditsResponse.data;
      const videos = videosResponse.data;

      const trailer = videos.results.find(
        (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
      );

      return {
        id: movie.id,
        title: movie.title,
        year: new Date(movie.release_date).getFullYear(),
        genre: movie.genres.map((g: any) => g.name),
        language: movie.original_language.toUpperCase(),
        rating: Math.round(movie.vote_average * 10) / 10,
        plot: movie.overview,
        director: credits.crew.find((c: any) => c.job === 'Director')?.name || 'Unknown',
        cast: credits.cast.slice(0, 5).map((c: any) => c.name),
        mood_tags: inferMoodTags(movie.genres),
        streaming_platforms: ['TMDB'],
        trailer_link: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '',
        poster: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : '',
        backdrop_path: movie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}` : '',
        overview: movie.overview,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
      };
    } catch (error) {
      console.error('Error fetching movie details:', error);
      return null;
    }
  },

  getGenres: async (): Promise<Genre[]> => {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'en-US',
        },
      });
      return response.data.genres;
    } catch (error) {
      console.error('Error fetching genres:', error);
      return [];
    }
  },
};

function convertTMDBToMovie(tmdbMovie: TMDBMovie): Movie {
  return {
    id: tmdbMovie.id,
    title: tmdbMovie.title,
    year: new Date(tmdbMovie.release_date).getFullYear(),
    genre: [],
    language: tmdbMovie.original_language.toUpperCase(),
    rating: Math.round(tmdbMovie.vote_average * 10) / 10,
    plot: tmdbMovie.overview,
    director: 'Unknown',
    cast: [],
    mood_tags: [],
    streaming_platforms: ['TMDB'],
    trailer_link: '',
    poster: tmdbMovie.poster_path ? `${TMDB_IMAGE_BASE_URL}${tmdbMovie.poster_path}` : '',
    poster_path: tmdbMovie.poster_path,
    backdrop_path: tmdbMovie.backdrop_path,
    overview: tmdbMovie.overview,
    release_date: tmdbMovie.release_date,
    vote_average: tmdbMovie.vote_average,
    vote_count: tmdbMovie.vote_count,
  };
}

function inferMoodTags(genres: any[]): string[] {
  const moodMap: { [key: string]: string[] } = {
    'Action': ['energetic', 'excited', 'intense'],
    'Adventure': ['excited', 'adventurous', 'energetic'],
    'Animation': ['happy', 'colorful', 'family'],
    'Comedy': ['happy', 'lighthearted', 'fun'],
    'Crime': ['intense', 'suspenseful', 'dark'],
    'Documentary': ['thoughtful', 'educational', 'informative'],
    'Drama': ['emotional', 'thoughtful', 'profound'],
    'Family': ['heartwarming', 'happy', 'wholesome'],
    'Fantasy': ['magical', 'imaginative', 'whimsical'],
    'History': ['educational', 'thoughtful', 'nostalgic'],
    'Horror': ['scary', 'intense', 'suspenseful'],
    'Music': ['upbeat', 'rhythmic', 'emotional'],
    'Mystery': ['suspenseful', 'intriguing', 'thoughtful'],
    'Romance': ['romantic', 'emotional', 'heartwarming'],
    'Science Fiction': ['futuristic', 'imaginative', 'thoughtful'],
    'TV Movie': ['casual', 'entertaining'],
    'Thriller': ['intense', 'suspenseful', 'anxious'],
    'War': ['intense', 'dramatic', 'historical'],
    'Western': ['adventurous', 'classic', 'rugged'],
  };

  const tags = new Set<string>();
  genres.forEach((genre) => {
    const genreName = typeof genre === 'string' ? genre : genre.name;
    const moods = moodMap[genreName] || [];
    moods.forEach((mood) => tags.add(mood));
  });

  return Array.from(tags);
}