// services/movieService.ts
import { Movie, MovieRecommendation, MovieFilters } from '@/types/movie';
import { MoodAnalysis } from '@/types/mood';
import { tmdbService } from './tmdbService';

export const movieService = {
  getPopularMovies: async (page: number = 1): Promise<Movie[]> => {
    return tmdbService.getPopularMovies(page);
  },

  getTopRatedMovies: async (page: number = 1): Promise<Movie[]> => {
    return tmdbService.getTopRatedMovies(page);
  },

  getNowPlayingMovies: async (page: number = 1): Promise<Movie[]> => {
    return tmdbService.getNowPlayingMovies(page);
  },

  getUpcomingMovies: async (page: number = 1): Promise<Movie[]> => {
    return tmdbService.getUpcomingMovies(page);
  },

  searchMovies: async (query: string): Promise<Movie[]> => {
    return tmdbService.searchMovies(query);
  },

  getMovieDetails: async (movieId: number): Promise<Movie | null> => {
    return tmdbService.getMovieDetails(movieId);
  },

  getSimilarMovies: async (movieId: number): Promise<Movie[]> => {
    return tmdbService.getSimilarMovies(movieId);
  },

  getRecommendedMovies: async (movieId: number): Promise<Movie[]> => {
    return tmdbService.getRecommendedMovies(movieId);
  },

  getMoviesByMood: async (moodAnalysis: MoodAnalysis): Promise<MovieRecommendation[]> => {
    try {
      // Get mood-based genre mappings
      const moodToGenres = getMoodGenreMapping();
      const primaryMoodGenres = moodToGenres[moodAnalysis.primaryMood] || [];
      
      // Get popular movies from multiple sources
      const [popular, topRated, nowPlaying] = await Promise.all([
        tmdbService.getPopularMovies(1),
        tmdbService.getTopRatedMovies(1),
        tmdbService.getNowPlayingMovies(1),
      ]);

      const allMovies = [...popular, ...topRated, ...nowPlaying];
      const uniqueMovies = removeDuplicateMovies(allMovies);

      // Score and filter movies based on mood
      const recommendations = uniqueMovies
        .map(movie => ({
          movie,
          matchScore: calculateMoodMatchScore(movie, moodAnalysis),
          reason: generateMatchReason(movie, moodAnalysis),
        }))
        .filter(rec => rec.matchScore > 30) // Only include movies with decent match
        .sort((a, b) => b.matchScore - a.matchScore);

      return recommendations.slice(0, 20); // Return top 20 recommendations
    } catch (error) {
      console.error('Error getting movies by mood:', error);
      return [];
    }
  },

  discoverMovies: async (filters: MovieFilters): Promise<Movie[]> => {
    return tmdbService.discoverMovies({
      genreIds: filters.genres,
      language: filters.language,
      minRating: filters.minRating,
      maxRating: filters.maxRating,
      year: filters.releaseYear,
    });
  },

  filterMoviesByAge: (movies: Movie[], maxAge: number = 18): Movie[] => {
    return movies.filter(movie => {
      const ageRating = movie.age_rating || 'PG';
      if (maxAge < 13) return ageRating === 'G';
      if (maxAge < 17) return ['G', 'PG', 'PG-13'].includes(ageRating);
      return true; // 17+ can watch all ratings
    });
  },

  filterExcludingFavorites: (movies: Movie[], favoriteIds: number[]): Movie[] => {
    return movies.filter(movie => !favoriteIds.includes(movie.id));
  },

  getGenres: async () => {
    return tmdbService.getGenres();
  },
};

function getMoodGenreMapping(): Record<string, string[]> {
  return {
    happy: ['Comedy', 'Animation', 'Family', 'Musical'],
    sad: ['Drama', 'Romance', 'Documentary'],
    excited: ['Action', 'Adventure', 'Thriller', 'Science Fiction'],
    calm: ['Documentary', 'Drama', 'Romance', 'Foreign'],
    anxious: ['Thriller', 'Horror', 'Mystery', 'Crime'],
    romantic: ['Romance', 'Comedy', 'Drama', 'Musical'],
    nostalgic: ['Drama', 'History', 'Western', 'War'],
    adventurous: ['Adventure', 'Action', 'Fantasy', 'Science Fiction'],
    mysterious: ['Mystery', 'Thriller', 'Crime', 'Horror'],
    thoughtful: ['Drama', 'Documentary', 'History', 'Biography'],
    energetic: ['Action', 'Comedy', 'Adventure', 'Musical'],
    melancholic: ['Drama', 'Romance', 'Independent', 'Foreign'],
    optimistic: ['Comedy', 'Family', 'Adventure', 'Musical'],
    contemplative: ['Drama', 'Documentary', 'Philosophy', 'Art House'],
  };
}

function calculateMoodMatchScore(movie: Movie, moodAnalysis: MoodAnalysis): number {
  let score = 50; // Base score

  // Primary mood match (40 points possible)
  const moodToGenres = getMoodGenreMapping();
  const primaryMoodGenres = moodToGenres[moodAnalysis.primaryMood] || [];
  const genreMatches = movie.genre.filter(genre => 
    primaryMoodGenres.some(moodGenre => 
      moodGenre.toLowerCase().includes(genre.toLowerCase())
    )
  ).length;
  score += genreMatches * 15;

  // Secondary mood matches (20 points possible)
  moodAnalysis.secondaryMoods.forEach(secondaryMood => {
    const secondaryGenres = moodToGenres[secondaryMood] || [];
    const secondaryMatches = movie.genre.filter(genre =>
      secondaryGenres.some(moodGenre =>
        moodGenre.toLowerCase().includes(genre.toLowerCase())
      )
    ).length;
    score += secondaryMatches * 5;
  });

  // Rating bonus (10 points possible)
  if (movie.rating >= 7) score += 10;
  else if (movie.rating >= 6) score += 5;

  // Recency bonus (10 points possible)
  if (movie.year >= new Date().getFullYear() - 2) score += 10;
  else if (movie.year >= new Date().getFullYear() - 5) score += 5;

  // Mood tag matches (20 points possible)
  const moodTagMatches = movie.mood_tags.filter(tag =>
    moodAnalysis.tags.includes(tag)
  ).length;
  score += moodTagMatches * 4;

  return Math.min(100, Math.max(0, score));
}

function generateMatchReason(movie: Movie, moodAnalysis: MoodAnalysis): string {
  const reasons = [];

  // Genre-based reason
  const moodToGenres = getMoodGenreMapping();
  const primaryMoodGenres = moodToGenres[moodAnalysis.primaryMood] || [];
  const matchingGenres = movie.genre.filter(genre =>
    primaryMoodGenres.some(moodGenre =>
      moodGenre.toLowerCase().includes(genre.toLowerCase())
    )
  );

  if (matchingGenres.length > 0) {
    reasons.push(`Perfect ${matchingGenres[0].toLowerCase()} match for your ${moodAnalysis.primaryMood} mood`);
  }

  // Rating reason
  if (movie.rating >= 7.5) {
    reasons.push('Highly rated');
  }

  // Recency reason
  if (movie.year >= new Date().getFullYear() - 1) {
    reasons.push('Recent release');
  }

  return reasons.length > 0 ? reasons[0] : `Recommended for ${moodAnalysis.primaryMood} mood`;
}

function removeDuplicateMovies(movies: Movie[]): Movie[] {
  const seen = new Set<number>();
  return movies.filter(movie => {
    if (seen.has(movie.id)) {
      return false;
    }
    seen.add(movie.id);
    return true;
  });
}

export default movieService;
