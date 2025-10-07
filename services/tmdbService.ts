// services/tmdbService.ts
import axios, { AxiosInstance } from 'axios';
import { TMDBMovie, TMDBResponse, Movie, Genre, TMDBMovieDetails, TMDBCredits, TMDBVideos } from '@/types/movie';

const TMDB_BEARER_TOKEN = process.env.EXPO_PUBLIC_TMDB_BEARER_TOKEN;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

if (!TMDB_BEARER_TOKEN) {
  console.warn('TMDB Bearer Token not found. Please check your environment variables.');
}

const tmdbClient: AxiosInstance = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000,
  headers: {
    'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`,
    'accept': 'application/json',
  },
  params: {
    language: 'en-US',
  },
});

// Add request interceptor for debugging
tmdbClient.interceptors.request.use(
  (config) => {
    console.log(`TMDB Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('TMDB Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
tmdbClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('TMDB Response Error:', {
      status: error?.response?.status,
      message: error?.message,
      url: error?.config?.url
    });
    return Promise.reject(error);
  }
);

export const tmdbService = {
  getMoviesByGenreAndLanguage: async (
    genreId: number,
    language: string,
    page: number = 1
  ): Promise<Movie[]> => {
    try {
      const response = await tmdbClient.get<TMDBResponse>('/discover/movie', {
        params: {
          sort_by: 'popularity.desc',
          with_genres: genreId,
          with_original_language: language,
          page,
          include_adult: false,
        },
      });
      return response.data.results.map(convertTMDBToMovie);
    } catch (error: any) {
      console.error('getMoviesByGenreAndLanguage failed:', error?.response?.status, error?.message);
      return [];
    }
  },

  searchMovies: async (query: string, page: number = 1): Promise<Movie[]> => {
    try {
      if (!query.trim()) {
        return [];
      }
      
      const response = await tmdbClient.get<TMDBResponse>('/search/movie', {
        params: {
          query: query.trim(),
          page,
          include_adult: false,
        },
      });
      return response.data.results.map(convertTMDBToMovie);
    } catch (error: any) {
      console.error('searchMovies failed:', error?.response?.status, error?.message);
      return [];
    }
  },

  getPopularMovies: async (page: number = 1): Promise<Movie[]> => {
    try {
      const response = await tmdbClient.get<TMDBResponse>('/movie/popular', {
        params: { page },
      });
      return response.data.results.map(convertTMDBToMovie);
    } catch (error: any) {
      console.error('getPopularMovies failed:', error?.response?.status, error?.message);
      return [];
    }
  },

  getTopRatedMovies: async (page: number = 1): Promise<Movie[]> => {
    try {
      const response = await tmdbClient.get<TMDBResponse>('/movie/top_rated', {
        params: { page },
      });
      return response.data.results.map(convertTMDBToMovie);
    } catch (error: any) {
      console.error('getTopRatedMovies failed:', error?.response?.status, error?.message);
      return [];
    }
  },

  getNowPlayingMovies: async (page: number = 1): Promise<Movie[]> => {
    try {
      const response = await tmdbClient.get<TMDBResponse>('/movie/now_playing', {
        params: { page },
      });
      return response.data.results.map(convertTMDBToMovie);
    } catch (error: any) {
      console.error('getNowPlayingMovies failed:', error?.response?.status, error?.message);
      return [];
    }
  },

  getUpcomingMovies: async (page: number = 1): Promise<Movie[]> => {
    try {
      const response = await tmdbClient.get<TMDBResponse>('/movie/upcoming', {
        params: { page },
      });
      return response.data.results.map(convertTMDBToMovie);
    } catch (error: any) {
      console.error('getUpcomingMovies failed:', error?.response?.status, error?.message);
      return [];
    }
  },

  getMovieDetails: async (movieId: number): Promise<Movie | null> => {
    try {
      const [movieRes, creditsRes, videosRes] = await Promise.all([
        tmdbClient.get<TMDBMovieDetails>(`/movie/${movieId}`),
        tmdbClient.get<TMDBCredits>(`/movie/${movieId}/credits`),
        tmdbClient.get<TMDBVideos>(`/movie/${movieId}/videos`),
      ]);

      const movie = movieRes.data;
      const credits = creditsRes.data;
      const videos = videosRes.data;

      const trailer = videos?.results?.find(
        (video) => video.type === 'Trailer' && video.site === 'YouTube'
      );

      return {
        id: movie.id,
        title: movie.title,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
        genre: movie.genres?.map((g) => g.name) || [],
        language: movie.original_language?.toLowerCase() || 'en',
        rating: Math.round(movie.vote_average * 10) / 10,
        plot: movie.overview || '',
        director: credits.crew?.find((c) => c.job === 'Director')?.name || 'Unknown',
        cast: credits.cast?.slice(0, 5).map((c) => c.name) || [],
        mood_tags: inferMoodTags(movie.genres || []),
        streaming_platforms: ['TMDB'],
        trailer_link: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '',
        poster: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : '',
        backdrop_path: movie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}` : '',
        overview: movie.overview || '',
        release_date: movie.release_date || '',
        vote_average: movie.vote_average || 0,
        vote_count: movie.vote_count || 0,
        age_rating: determineAgeRating(movie.vote_average, movie.genres || []),
      };
    } catch (error: any) {
      console.error('getMovieDetails failed:', error?.response?.status, error?.message);
      return null;
    }
  },

  getSimilarMovies: async (movieId: number, page: number = 1): Promise<Movie[]> => {
    try {
      const response = await tmdbClient.get<TMDBResponse>(`/movie/${movieId}/similar`, {
        params: { page },
      });
      return response.data.results.map(convertTMDBToMovie);
    } catch (error: any) {
      console.error('getSimilarMovies failed:', error?.response?.status, error?.message);
      return [];
    }
  },

  getRecommendedMovies: async (movieId: number, page: number = 1): Promise<Movie[]> => {
    try {
      const response = await tmdbClient.get<TMDBResponse>(`/movie/${movieId}/recommendations`, {
        params: { page },
      });
      return response.data.results.map(convertTMDBToMovie);
    } catch (error: any) {
      console.error('getRecommendedMovies failed:', error?.response?.status, error?.message);
      return [];
    }
  },

  getGenres: async (): Promise<Genre[]> => {
    try {
      const response = await tmdbClient.get('/genre/movie/list');
      return response.data.genres || [];
    } catch (error: any) {
      console.error('getGenres failed:', error?.response?.status, error?.message);
      return [];
    }
  },

  discoverMovies: async (params: {
    genreIds?: number[];
    language?: string;
    minRating?: number;
    maxRating?: number;
    year?: number;
    sortBy?: string;
    page?: number;
  }): Promise<Movie[]> => {
    try {
      const response = await tmdbClient.get<TMDBResponse>('/discover/movie', {
        params: {
          with_genres: params.genreIds?.join(','),
          with_original_language: params.language,
          'vote_average.gte': params.minRating,
          'vote_average.lte': params.maxRating,
          year: params.year,
          sort_by: params.sortBy || 'popularity.desc',
          page: params.page || 1,
          include_adult: false,
        },
      });
      return response.data.results.map(convertTMDBToMovie);
    } catch (error: any) {
      console.error('discoverMovies failed:', error?.response?.status, error?.message);
      return [];
    }
  },
};

function convertTMDBToMovie(tmdbMovie: TMDBMovie): Movie {
  return {
    id: tmdbMovie.id,
    title: tmdbMovie.title,
    year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : 0,
    genre: [], // Will be populated by additional API calls if needed
    language: tmdbMovie.original_language?.toLowerCase() || 'en',
    rating: Math.round(tmdbMovie.vote_average * 10) / 10,
    plot: tmdbMovie.overview || '',
    director: 'Unknown',
    cast: [],
    mood_tags: [],
    streaming_platforms: ['TMDB'],
    trailer_link: '',
    poster: tmdbMovie.poster_path ? `${TMDB_IMAGE_BASE_URL}${tmdbMovie.poster_path}` : '',
    poster_path: tmdbMovie.poster_path,
    backdrop_path: tmdbMovie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${tmdbMovie.backdrop_path}` : '',
    overview: tmdbMovie.overview || '',
    release_date: tmdbMovie.release_date || '',
    vote_average: tmdbMovie.vote_average || 0,
    vote_count: tmdbMovie.vote_count || 0,
    age_rating: determineAgeRating(tmdbMovie.vote_average, []),
  };
}

function inferMoodTags(genres: { id: number; name: string }[]): string[] {
  const moodMap: Record<string, string[]> = {
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
    const moodTags = moodMap[genre.name];
    if (moodTags) {
      moodTags.forEach((mood) => tags.add(mood));
    }
  });

  return Array.from(tags);
}

function determineAgeRating(voteAverage: number, genres: { id: number; name: string }[]): string {
  const genreNames = genres.map(g => g.name.toLowerCase());
  
  if (genreNames.includes('horror') || genreNames.includes('thriller')) {
    return 'R';
  }
  if (genreNames.includes('action') || genreNames.includes('crime')) {
    return 'PG-13';
  }
  if (genreNames.includes('animation') || genreNames.includes('family')) {
    return 'G';
  }
  
  return voteAverage > 7 ? 'PG-13' : 'PG';
}

export default tmdbService;
