// app/(tabs)/index.tsx (Enhanced Home Screen)
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useMovieStore } from '@/store/useMovieStore';
import { useMoodStore } from '@/store/useMoodStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { movieService } from '@/services/movieService';
import { useMovieRecommendations } from '@/hooks/useMovieRecommendations';
import MovieCard from '@/components/movie/MovieCard';
import SwipeableMovieCard from '@/components/movie/SwipeableMovieCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MoodColors } from '@/constants/Colors';
import { Movie } from '@/types/movie';
import { MoodAnalysis } from '@/types/mood';

const { width } = Dimensions.get('window');

const TRENDING_MOVIES_COUNT = 10;
const MOOD_MATCHED_MOVIES_COUNT = 3;
const FAVORITE_MOVIES_COUNT = 5;
const RECOMMENDED_MOVIES_COUNT = 6;

export default function HomeScreen() {
  const router = useRouter();
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [moodMatchedMovies, setMoodMatchedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { currentMoodAnalysis, completionPercentage, moodHistory } =
    useMoodStore();
  const { recommendations } = useMovieStore();
  const { favorites, getFavoriteCount } = useFavoriteStore();
  const { profile } = useSettingsStore();
  const { generateRecommendations, refreshRecommendations } = useMovieRecommendations();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (currentMoodAnalysis) {
      loadMoodMatchedMovies();
    }
  }, [currentMoodAnalysis, profile]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [popular, topRated] = await Promise.all([
        movieService.getPopularMovies(),
        movieService.getTopRatedMovies(),
      ]);
      
      // Combine and filter based on user preferences
      const allMovies = [...(popular || []), ...(topRated || [])];
      const filteredMovies = filterMoviesByPreferences(allMovies);
      setTrendingMovies(filteredMovies.slice(0, TRENDING_MOVIES_COUNT));
      setError(null);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load trending movies.');
      setTrendingMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoodMatchedMovies = async () => {
    if (!currentMoodAnalysis) return;

    try {
      const moodRecommendations = await movieService.getMoviesByMood(
        currentMoodAnalysis
      );
      const filteredRecommendations = filterMoviesByPreferences(
        moodRecommendations.map((r) => r.movie)
      );
      setMoodMatchedMovies(
        filteredRecommendations.slice(0, MOOD_MATCHED_MOVIES_COUNT)
      );
      setError(null);
    } catch (error) {
      console.error('Error loading mood matched movies:', error);
      setError('Failed to load movies matching your mood.');
      setMoodMatchedMovies([]);
    }
  };

  const filterMoviesByPreferences = (movies: Movie[]) => {
    if (!Array.isArray(movies)) return [];

    return movies.filter((movie) => {
      // Filter by preferred languages
      if (profile.preferredLanguages?.length > 0) {
        const movieLang = movie.language?.toLowerCase() || 'en';
        if (!profile.preferredLanguages.includes(movieLang)) {
          return false;
        }
      }
      
      // Filter by favorite genres
      if (profile.favoriteGenres?.length > 0 && movie.genre?.length > 0) {
        const hasMatchingGenre = movie.genre.some((genre: string) =>
          profile.favoriteGenres.includes(genre)
        );
        if (!hasMatchingGenre) {
          return false;
        }
      }
      
      return true;
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadInitialData(),
        refreshRecommendations(),
        loadMoodMatchedMovies(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTakePuzzle = () => {
    router.push('/puzzles');
  };

  const handleViewAllRecommendations = () => {
    router.push('/movies');
  };

  const handleViewFavorites = () => {
    router.push('/favorites');
  };

  const handleViewMoodHistory = () => {
    router.push('/mood-history');
  };

  const safeRecommendations = Array.isArray(recommendations) ? recommendations : [];
  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  const safeMoodHistory = Array.isArray(moodHistory) ? moodHistory : [];

  // Get background color based on mood
  const getMoodBackgroundColor = () => {
    if (!currentMoodAnalysis) return MoodColors.default;
    return MoodColors[currentMoodAnalysis.primaryMood] || MoodColors.default;
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: getMoodBackgroundColor() }]}>
      <Text style={styles.welcomeText}>
        Welcome back{profile.name ? `, ${profile.name}` : ''}!
      </Text>
      <Text style={styles.taglineText}>
        {currentMoodAnalysis 
          ? `Feeling ${currentMoodAnalysis.primaryMood}? Perfect movies await!`
          : 'Discover movies that match your mood'
        }
      </Text>
    </View>
  );

  const renderMoodSection = () => (
    <Card style={styles.moodCard}>
      <View style={styles.moodHeader}>
        <Ionicons name="happy" size={24} color="#007AFF" />
        <Text style={styles.cardTitle}>Mood Analysis</Text>
      </View>
      
      {currentMoodAnalysis ? (
        <View>
          <View style={styles.moodResult}>
            <Text style={styles.moodText}>
              Current Mood: <Text style={styles.moodValue}>
                {currentMoodAnalysis.primaryMood.charAt(0).toUpperCase() + 
                 currentMoodAnalysis.primaryMood.slice(1)}
              </Text>
            </Text>
            <Text style={styles.confidenceText}>
              Confidence: {Math.round((currentMoodAnalysis.confidence || 0) * 100)}%
            </Text>
          </View>
          
          {currentMoodAnalysis.secondaryMoods?.length > 0 && (
            <View style={styles.secondaryMoods}>
              <Text style={styles.secondaryLabel}>Also feeling:</Text>
              <View style={styles.moodTags}>
                {currentMoodAnalysis.secondaryMoods.slice(0, 3).map((mood, index) => (
                  <View key={index} style={styles.moodTag}>
                    <Text style={styles.moodTagText}>
                      {mood.charAt(0).toUpperCase() + mood.slice(1)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          <View style={styles.moodActions}>
            <Button
              title="Get New Recommendations"
              onPress={generateRecommendations}
              style={styles.primaryButton}
              size="small"
            />
            <Button
              title="Retake Puzzle"
              onPress={handleTakePuzzle}
              variant="outline"
              style={styles.secondaryButton}
              size="small"
            />
          </View>
        </View>
      ) : (
        <View>
          <Text style={styles.description}>
            Complete mood puzzles to get personalized movie recommendations
          </Text>
          {completionPercentage > 0 && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Progress: {completionPercentage}%
              </Text>
              <ProgressBar progress={completionPercentage} />
            </View>
          )}
          <Button
            title="Take Mood Puzzle"
            onPress={handleTakePuzzle}
            style={styles.button}
          />
        </View>
      )}
    </Card>
  );

  const renderStatsSection = () => (
    <View style={styles.statsContainer}>
      <TouchableOpacity style={styles.statCard} onPress={handleViewFavorites}>
        <Ionicons name="heart" size={24} color="#FF3B30" />
        <Text style={styles.statNumber}>{getFavoriteCount()}</Text>
        <Text style={styles.statLabel}>Favorites</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.statCard} onPress={handleViewAllRecommendations}>
        <Ionicons name="film" size={24} color="#007AFF" />
        <Text style={styles.statNumber}>{safeRecommendations.length}</Text>
        <Text style={styles.statLabel}>Recommendations</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.statCard} onPress={handleViewMoodHistory}>
        <Ionicons name="analytics" size={24} color="#34C759" />
        <Text style={styles.statNumber}>{safeMoodHistory.length}</Text>
        <Text style={styles.statLabel}>Mood History</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFavoriteMovies = () => {
    if (safeFavorites.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Favorites</Text>
          <Button
            title="View All"
            variant="outline"
            onPress={handleViewFavorites}
            style={styles.viewAllButton}
            size="small"
          />
        </View>
        <FlatList
          horizontal
          data={safeFavorites.slice(0, FAVORITE_MOVIES_COUNT)}
          keyExtractor={(item: Movie) => `fav-${item.id}`}
          renderItem={({ item }: { item: Movie }) => (
            <View style={styles.horizontalMovieCard}>
              <MovieCard movie={item} showFavoriteButton={true} />
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>
    );
  };

  const renderMoodMatchedSection = () => {
    if (!currentMoodAnalysis || moodMatchedMovies.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Perfect for Your {currentMoodAnalysis.primaryMood.charAt(0).toUpperCase() + 
            currentMoodAnalysis.primaryMood.slice(1)} Mood
          </Text>
          <TouchableOpacity onPress={handleViewMoodHistory}>
            <Text style={styles.moodHistoryLink}>History</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={moodMatchedMovies}
          keyExtractor={(item: Movie) => `mood-${item.id}`}
          renderItem={({ item }: { item: Movie }) => (
            <View style={styles.horizontalMovieCard}>
              <SwipeableMovieCard movie={item} />
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
        <Text style={styles.moodMatchNote}>
          💡 Based on your latest mood analysis
        </Text>
      </View>
    );
  };

  const renderRecommendationsSection = () => {
    if (safeRecommendations.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <Button
            title="View All"
            variant="outline"
            onPress={handleViewAllRecommendations}
            style={styles.viewAllButton}
            size="small"
          />
        </View>
        <FlatList
          horizontal
          data={safeRecommendations.slice(0, RECOMMENDED_MOVIES_COUNT).map((r) => r.movie)}
          keyExtractor={(item: Movie) => `rec-${item.id}`}
          renderItem={({ item }: { item: Movie }) => (
            <View style={styles.horizontalMovieCard}>
              <SwipeableMovieCard movie={item} />
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>
    );
  };

  const renderTrendingSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Trending Now</Text>
      <FlatList
        horizontal
        data={trendingMovies}
        keyExtractor={(item: Movie) => `trending-${item.id}`}
        renderItem={({ item }: { item: Movie }) => (
          <View style={styles.horizontalMovieCard}>
            <SwipeableMovieCard movie={item} />
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );

  const sections = [
    { type: 'header', id: 'header' },
    { type: 'mood', id: 'mood' },
    { type: 'stats', id: 'stats' },
    { type: 'favorites', id: 'favorites' },
    { type: 'mood-matched', id: 'mood-matched' },
    { type: 'recommendations', id: 'recommendations' },
    { type: 'trending', id: 'trending' },
  ];

  const renderSection = ({ item }: { item: { type: string } }) => {
    switch (item.type) {
      case 'header':
        return renderHeader();
      case 'mood':
        return renderMoodSection();
      case 'stats':
        return renderStatsSection();
      case 'favorites':
        return renderFavoriteMovies();
      case 'mood-matched':
        return renderMoodMatchedSection();
      case 'recommendations':
        return renderRecommendationsSection();
      case 'trending':
        return renderTrendingSection();
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getMoodBackgroundColor() }]}>
      <StatusBar style="auto" />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={loadInitialData} />
        </View>
      )}

      <FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderSection}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
        style={styles.list}
      />
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <LoadingSpinner />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 120,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  taglineText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  moodCard: {
    margin: 20,
    marginTop: 10,
  },
  moodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  moodResult: {
    marginBottom: 12,
  },
  moodText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  moodValue: {
    fontWeight: '600',
    color: '#007AFF',
  },
  confidenceText: {
    fontSize: 14,
    color: '#666',
  },
  secondaryMoods: {
    marginBottom: 16,
  },
  secondaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  moodTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  moodTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moodTagText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  moodActions: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 22,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 10,
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  moodHistoryLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  horizontalList: {
    paddingLeft: 20,
  },
  horizontalMovieCard: {
    marginRight: 12,
    width: 140,
  },
  moodMatchNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
});
