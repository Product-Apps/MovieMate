// app/(tabs)/movies.tsx (Updated to use language filtering)
import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, Text, Pressable, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMovieStore } from '@/store/useMovieStore';
import { useMoodStore } from '@/store/useMoodStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Movie } from '@/types/movie';
import { movieService } from '@/services/movieService';
import MovieCard from '@/components/movie/MovieCard';
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
  const { currentMoodAnalysis } = useMoodStore();
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
  }, [searchQuery, selectedLanguages]);

  const loadMovies = async () => {
    setLoading(true);
    setMovieLoading(true);
    setError(null);

    try {
      console.log('Loading movies for languages:', selectedLanguages);
      
      let movies: Movie[] = [];

      if (selectedGenres.length > 0) {
        // Get movies by genre and language
        for (const genreId of selectedGenres) {
          const genreMovies = await movieService.getMoviesByGenre(genreId, 1, selectedLanguages);
          movies = [...movies, ...genreMovies];
        }
      } else {
        // Get popular movies for selected languages
        movies = await movieService.getPopularMovies(1, selectedLanguages);
      }

      const filtered = movieService.filterMoviesByAge(movies);
      const movieRecommendations = filtered.map(movie => ({
        movie,
        matchScore: Math.floor(Math.random() * 30) + 70,
        reason: `${movie.language.toUpperCase()} ${currentMoodAnalysis ? currentMoodAnalysis.primaryMood : 'Popular'} pick`
      }));

      // Remove duplicates based on movie ID
      const uniqueRecommendations = movieRecommendations.filter((rec, index, self) =>
        index === self.findIndex(r => r.movie.id === rec.movie.id)
      );

      const favoriteIds = favorites.map(f => f.id);
      const filteredRecommendations = uniqueRecommendations.filter(
        rec => !favoriteIds.includes(rec.movie.id)
      );

      console.log(`Found ${filteredRecommendations.length} movies for languages:`, selectedLanguages);
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
    if (searchQuery.length <= 2) return;
    
    try {
      console.log('Searching movies:', searchQuery, 'in languages:', selectedLanguages);
      const results = await movieService.searchMovies(searchQuery, 1, selectedLanguages);
      const filtered = movieService.filterMoviesByAge(results);
      const favoriteIds = favorites.map(f => f.id);
      const excludingFavorites = movieService.filterExcludingFavorites(filtered, favoriteIds);
      console.log(`Search found ${excludingFavorites.length} results`);
      setSearchResults(excludingFavorites);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const getSelectedLanguageNames = () => {
    const LANGUAGES = [
      { code: 'en', name: 'English' },
      { code: 'hi', name: 'Hindi' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'fr', name: 'French' },
      { code: 'es', name: 'Spanish' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
    ];
    
    return LANGUAGES
      .filter(lang => selectedLanguages.includes(lang.code))
      .map(lang => lang.name)
      .join(', ');
  };

  const moviesToDisplay = searchQuery.length > 2 ? searchResults : recommendations.map(r => r.movie);

  const renderHeader = () => (
    <>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search movies in ${getSelectedLanguageNames()}...`}
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
        <Text style={styles.filterButtonText}>Filters & Languages</Text>
      </Pressable>

      {/* Language Info */}
      <View style={styles.languageInfo}>
        <Text style={styles.languageInfoText}>
          🌍 Showing: {getSelectedLanguageNames()} movies ({moviesToDisplay.length} found)
        </Text>
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
    </>
  );

  const renderFooter = () => (
    <>
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
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>
        {searchQuery.length > 2 ? '🔍 No Search Results' : '🎬 No Movies Found'}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery.length > 2 
          ? `No movies found for "${searchQuery}" in ${getSelectedLanguageNames()}.`
          : `No movies available for ${getSelectedLanguageNames()}. Try selecting different languages.`
        }
      </Text>
      {searchQuery.length === 0 && (
        <Pressable 
          style={styles.startButton} 
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.startButtonText}>Change Languages</Text>
        </Pressable>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>🎬 Loading {getSelectedLanguageNames()} movies...</Text>
        <Text style={styles.loadingSubtext}>Finding the best content for you</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>😕 Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={loadMovies}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎬 Discover Movies</Text>
      </View>

      <FlatList
        data={moviesToDisplay}
        renderItem={({ item }) => <MovieCard movie={item} showFavoriteButton={true} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginTop: 16,
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
    marginHorizontal: 20,
    marginBottom: 12,
  },
  filterButtonText: {
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  languageInfo: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#90caf9',
  },
  languageInfoText: {
    fontSize: 13,
    color: '#1565c0',
    textAlign: 'center',
    fontWeight: '500',
  },
  filtersContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 8,
  },
  moodIndicator: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 12,
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
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  ageFilterText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
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
    textAlign: 'center',
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
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
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
