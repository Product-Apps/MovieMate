// types/index.ts
export * from './movie';
export * from './mood';
export * from './puzzle';

export interface UserProfile {
  id?: string;
  name: string;
  age: number;
  favoriteGenres: string[];
  preferredLanguages: string[];
  contentRating: 'G' | 'PG' | 'PG-13' | 'R' | 'all';
  avatar?: string;
  bio?: string;
  country?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  autoPlay: boolean;
  dataUsage: 'low' | 'medium' | 'high';
  cacheSize: number;
  version: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  totalPages?: number;
  totalItems?: number;
}

export interface SearchParams {
  query: string;
  filters?: any;
  sort?: 'relevance' | 'date' | 'rating' | 'popularity';
  order?: 'asc' | 'desc';
}
