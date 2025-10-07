// app/(tabs)/movies.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, Pressable, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMovieStore } from '@/store/useMovieStore';
import { useMoodStore } from '@/store/useMoodStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Movie, MovieRecommendation } from '@/types/movie';
import { moodAnalyzer } from '@/services/moodAnalyzer';
import { recommendationEngine } from '@/services/movieRecommendationEngine';
import { movieService } from '@/services/movieService';
import MovieList from '@/components/movie/MovieList';
import GenreSelector from '@/components/movie/GenreSelector';
import LanguageSelector from '@/components/movie/LanguageSelector';

export default function MoviesScreen() {
  const router = useRouter();
  const { 
    recommendations, 
    setRecommendations, 
    setLoading: setMovieLoading,
    selectedLanguages,
    selectedGenres,
  } = useMovieStore();
  const { currentMoodAnalysis, puzzleResponses, setMoodAnalysis } = useMoodStore();
  const { favorites } = useFavoriteStore();
  const { profile } = useSettingsStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadMovies();
  }, [selectedLanguages, selectedGenres]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchMovies();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadMovies = async () => {
    setLoading(true);
    setMovieLoading(true);
    setError(null);

    try {
      let movieRecommendations: MovieRecommendation[] = [];

      if (puzzleResponses.length > 0) {
        let moodAnalysis = currentMoodAnalysis;
        if (!moodAnalysis) {
          moodAnalysis = moodAnalyzer.analyzeMood(puzzleResponses);
          setMoodAnalysis(moodAnalysis);
        }

        movieRecommendations = await recommendationEngine.generateRecommendations(
          moodAnalysis,
          puzzleResponses,
          selectedLanguages.length > 0 ? selectedLanguages : ['en'],
          20
        );
      } else {
        // Load popular movies if no mood analysis
        const popular = await movieService.getPopularMovies();
        const filtered = movieService.filterMoviesByAge(popular);
        movieRecommendations = filtered.map(movie => ({
          movie,
          matchScore: Math.floor(Math.random() * 30) + 70,
          reason: 'Popular choice'
        }));
      }

      // Exclude favorites from recommendations
      const favoriteIds = favorites.map(f => f.id);
      const filteredRecommendations = movieRecommendations.filter(
        rec => !favoriteIds.includes(rec.movie.id)
      );

      setRecommendations(filteredRecommendations);
    } catch (err) {
      console.error('Error loading movies:', err);
      setError('Failed to load movies. Please try again.');
    } finally {
      setLoading(false);
      setMovieLoading(false);
    }
  };

  const searchMovies = async () => {
    try {
      const results = await movieService.searchMovies(searchQuery);
      const filtered = movieService.filterMoviesByAge(results);
      const favoriteIds = favorites.map(f => f.id);
      const excludingFavorites = movieService.filterExcludingFavorites(filtered, favoriteIds);
      setSearchResults(excludingFavorites);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleRetry = () => {
    setError(null);
    loadMovies();
  };

  const moviesToDisplay = searchQuery.length > 2 ? searchResults : recommendations.map(r => r.movie);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>🎬 Finding perfect movies...</Text>
        <Text style={styles.loadingSubtext}>Analyzing your preferences</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>😕 Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
        <Pressable 
          style={styles.secondaryButton} 
          onPress={() => router.push('/puzzles')}
        >
          <Text style={styles.secondaryButtonText}>Retake Puzzles</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎬 Discover Movies</Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search movies..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </Pressable>
          )}
        </View>

        {/* Filter Button */}
        <Pressable 
          style={styles.filterButton} 
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options" size={20} color="#007AFF" />
          <Text style={styles.filterButtonText}>Filters</Text>
        </Pressable>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <LanguageSelector />
          <GenreSelector />
        </View>
      )}

      {/* Current Mood Indicator */}
      {currentMoodAnalysis && searchQuery.length === 0 && (
        <View style={styles.moodIndicator}>
          <Text style={styles.moodText}>
            Based on your {currentMoodAnalysis.primaryMood} mood
          </Text>
          <Text style={styles.confidenceText}>
            {Math.round(currentMoodAnalysis.confidence * 100)}% confidence
          </Text>
        </View>
      )}

      {/* Age Filter Info */}
      {profile.age < 18 && (
        <View style={styles.ageFilterInfo}>
          <Text style={styles.ageFilterText}>
            Showing age-appropriate content for {profile.age} years old
          </Text>
        </View>
      )}

      {/* Movies List */}
      <ScrollView style={styles.moviesContainer} showsVerticalScrollIndicator={false}>
        {moviesToDisplay.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {searchQuery.length > 2 ? '🔍 No Search Results' : '🧩 No Recommendations Yet'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery.length > 2 
                ? `No movies found for "${searchQuery}". Try a different search term.`
                : 'Complete the mood puzzles to get personalized movie recommendations!'
              }
            </Text>
            {searchQuery.length === 0 && (
              <Pressable 
                style={styles.startButton} 
                onPress={() => router.push('/puzzles')}
              >
                <Text style={styles.startButtonText}>Start Puzzles</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <MovieList 
            movies={moviesToDisplay} 
            showFavoriteButton={true}
            emptyMessage={searchQuery.length > 2 ? "No movies found" : "No recommendations available"}
          />
        )}
      </ScrollView>

      {/* Retake Puzzles Button */}
      {recommendations.length > 0 && searchQuery.length === 0 && (
        <View style={styles.actions}>
          <Pressable 
            style={styles.retakeButton} 
            onPress={() => router.push('/puzzles')}
          >
            <Ionicons name="refresh" size={20} color="#007AFF" />
            <Text style={styles.retakeButtonText}>🔄 Retake Puzzles</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
  },
  filterButtonText: {
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  filtersContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  moodIndicator: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  moodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  confidenceText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  ageFilterInfo: {
    backgroundColor: '#fff3cd',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  ageFilterText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
  },
  moviesContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 32,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    minWidth: 150,
    alignItems: 'center',
    marginBottom: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    minWidth: 150,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    minWidth: 150,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
  },
  retakeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
