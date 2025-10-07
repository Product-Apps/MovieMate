// app/(tabs)/index.tsx (Fixed - No nested ScrollView)
import React, { useEffect } from 'react';
import { StyleSheet, FlatList, Pressable, Alert, View, Text, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMoodStore } from '@/store/useMoodStore';
import { useMovieStore } from '@/store/useMovieStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import MovieCard from '@/components/movie/MovieCard';
import { movieService } from '@/services/movieService';

export default function HomeScreen() {
  const router = useRouter();
  const { currentMoodAnalysis, resetPuzzleData } = useMoodStore();
  const { recommendations, setRecommendations } = useMovieStore();
  const { favorites, getFavoriteCount } = useFavoriteStore();
  const { profile } = useSettingsStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const popular = await movieService.getPopularMovies();
      const filtered = movieService.filterMoviesByAge(popular);
      const excludingFavorites = movieService.filterExcludingFavorites(
        filtered, 
        favorites.map(f => f.id)
      );
      
      setRecommendations(
        excludingFavorites.slice(0, 10).map(movie => ({
          movie,
          matchScore: Math.floor(Math.random() * 30) + 70,
          reason: 'Popular choice'
        }))
      );
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
  };

  const handleStartPuzzles = () => {
    resetPuzzleData();
    router.push('/puzzles');
  };

  const handleViewMovies = () => {
    if (recommendations.length === 0) {
      Alert.alert(
        'No Recommendations',
        'Complete the mood puzzles first to get personalized movie recommendations!',
        [
          { text: 'OK' },
          { text: 'Start Puzzles', onPress: handleStartPuzzles }
        ]
      );
      return;
    }
    router.push('/movies');
  };

  const handleViewFavorites = () => {
    if (favorites.length === 0) {
      Alert.alert('No Favorites', 'Add some movies to your favorites first!');
      return;
    }
    router.push('/favorites');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderHeader = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {getGreeting()}{profile.name ? `, ${profile.name}` : ''}! 👋
        </Text>
        <Text style={styles.title}>🎬 MoodFlix</Text>
        <Text style={styles.subtitle}>
          Discover movies through interactive puzzles that reveal your mood
        </Text>
      </View>

      {/* Current Mood */}
      {currentMoodAnalysis && (
        <View style={styles.moodSection}>
          <Text style={styles.sectionTitle}>Current Mood</Text>
          <View style={styles.moodCard}>
            <Text style={styles.moodType}>{currentMoodAnalysis.primaryMood}</Text>
            <Text style={styles.moodConfidence}>
              {Math.round(currentMoodAnalysis.confidence * 100)}% confidence
            </Text>
          </View>
        </View>
      )}

      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Ionicons name="heart" size={24} color="#FF3B30" />
          <Text style={styles.statNumber}>{getFavoriteCount()}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="film" size={24} color="#007AFF" />
          <Text style={styles.statNumber}>{recommendations.length}</Text>
          <Text style={styles.statLabel}>Recommendations</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="person" size={24} color="#34C759" />
          <Text style={styles.statNumber}>{profile.age}</Text>
          <Text style={styles.statLabel}>Age</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <Pressable style={styles.primaryButton} onPress={handleStartPuzzles}>
          <Ionicons name="extension-puzzle" size={24} color="white" />
          <Text style={styles.primaryButtonText}>Start Mood Puzzles</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={handleViewMovies}>
          <Ionicons name="film-outline" size={24} color="#007AFF" />
          <Text style={styles.secondaryButtonText}>View Recommendations</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={handleViewFavorites}>
          <Ionicons name="heart-outline" size={24} color="#FF3B30" />
          <Text style={styles.secondaryButtonText}>My Favorites</Text>
        </Pressable>
      </View>

      {/* Your Favorites Section */}
      {favorites.length > 0 && (
        <View style={styles.moviesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Favorites</Text>
            <Pressable onPress={handleViewFavorites}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );

  const renderFooter = () => (
    <>
      {/* Recommended Section */}
      {recommendations.length > 0 && (
        <View style={styles.moviesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <Pressable onPress={handleViewMovies}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );

  const allMovies = [
    ...favorites.slice(0, 4),
    ...recommendations.slice(0, 6).map(r => r.movie),
  ];

  return (
    <FlatList
      data={allMovies}
      renderItem={({ item }) => <MovieCard movie={item} showFavoriteButton={true} />}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.row}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  moodSection: {
    padding: 20,
  },
  moodCard: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  moodType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    textTransform: 'capitalize',
  },
  moodConfidence: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionSection: {
    padding: 20,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  moviesSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});
