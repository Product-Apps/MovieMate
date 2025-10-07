// types/movie.ts
export interface Movie {
  id: number;
  title: string;
  year: number;
  genre: string[];
  language: string;
  rating: number;
  plot: string;
  director: string;
  cast: string[];
  mood_tags: string[];
  streaming_platforms: string[];
  trailer_link: string;
  poster: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  release_date?: string;
  vote_average?: number;
  vote_count?: number;
  age_rating?: string;
}

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
}

export interface TMDBResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface MovieRecommendation {
  movie: Movie;
  matchScore: number;
  reason: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieFilters {
  genres: number[];
  language: string;
  minRating: number;
  maxRating: number;
  releaseYear?: number;
}

export interface TMDBMovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genres: { id: number; name: string }[];
  vote_average: number;
  vote_count: number;
  runtime: number;
  original_language: string;
  production_companies: { id: number; name: string; logo_path: string | null }[];
  budget: number;
  revenue: number;
}

export interface TMDBCredits {
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }[];
  crew: {
    id: number;
    name: string;
    job: string;
    department: string;
  }[];
}

export interface TMDBVideos {
  results: {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
    official: boolean;
  }[];
}
