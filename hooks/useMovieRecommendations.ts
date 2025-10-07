// hooks/useMovieRecommendations.ts
import { useEffect, useState } from 'react';
import { useMoodStore } from '@/store/useMoodStore';
import { useMovieStore } from '@/store/useMovieStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { movieService } from '@/services/movieService';
import { MovieRecommendation } from '@/types/movie';

export function useMovieRecommendations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { currentMoodAnalysis } = useMoodStore();
  const { recommendations, setRecommendations } = useMovieStore();
  const { favorites } = useFavoriteStore();

  const generateRecommendations = async () => {
    if (!currentMoodAnalysis) return;

    setLoading(true);
    setError(null);

    try {
      const moodBasedRecommendations = await movieService.getMoviesByMood(currentMoodAnalysis);
      
      // Filter out favorites
      const favoriteIds = favorites.map(f => f.id);
      const filteredRecommendations = moodBasedRecommendations.filter(
        rec => !favoriteIds.includes(rec.movie.id)
      );

      setRecommendations(filteredRecommendations);
    } catch (err) {
      setError('Failed to generate recommendations');
      console.error('Error generating recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshRecommendations = async () => {
    try {
      setLoading(true);
      const [popular, topRated] = await Promise.all([
        movieService.getPopularMovies(),
        movieService.getTopRatedMovies(),
      ]);

      const allMovies = [...popular, ...topRated];
      const favoriteIds = favorites.map(f => f.id);
      const filteredMovies = allMovies.filter(movie => !favoriteIds.includes(movie.id));

      const recommendations: MovieRecommendation[] = filteredMovies
        .slice(0, 20)
        .map((movie, index) => ({
          movie,
          matchScore: Math.floor(Math.random() * 30) + 70,
          reason: index < 10 ? 'Popular choice' : 'Highly rated',
        }));

      setRecommendations(recommendations);
    } catch (err) {
      setError('Failed to refresh recommendations');
      console.error('Error refreshing recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    recommendations,
    loading,
    error,
    generateRecommendations,
    refreshRecommendations,
  };
}

export default useMovieRecommendations;
