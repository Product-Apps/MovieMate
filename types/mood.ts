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
  adult?: boolean;
  age_rating?: string;
}

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
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