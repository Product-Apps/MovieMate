// app/favorites.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import MovieList from '@/components/movie/MovieList';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, clearFavorites, getFavoritesByGenre } = useFavoriteStore();
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const genres = Array.from(
    new Set(favorites.flatMap(movie => movie.genre))
  ).sort();

  const displayMovies = selectedGenre 
    ? getFavoritesByGenre(selectedGenre)
    : favorites;

  const handleClearFavorites = () => {
    Alert.alert(
      'Clear All Favorites',
      'Are you sure you want to remove all movies from your favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            clearFavorites();
            Alert.alert('Success', 'All favorites have been cleared.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </Pressable>
        <Text style={styles.title}>❤️ My Favorites</Text>
        <View style={styles.placeholder} />
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptyText}>
            Add movies to your favorites by tapping the heart icon on any movie card.
          </Text>
          <Pressable 
            style={styles.exploreButton}
            onPress={() => router.push('/movies')}
          >
            <Text style={styles.exploreButtonText}>Explore Movies</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Stats & Filters */}
          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{favorites.length}</Text>
              <Text style={styles.statLabel}>Total Favorites</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{genres.length}</Text>
              <Text style={styles.statLabel}>Different Genres</Text>
            </View>

            <Pressable 
              style={[styles.statCard, styles.clearButton]}
              onPress={handleClearFavorites}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={styles.clearButtonText}>Clear All</Text>
            </Pressable>
          </View>

          {/* Genre Filter */}
          {genres.length > 0 && (
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Filter by Genre:</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.genreScrollContainer}
              >
                <Pressable
                  style={[
                    styles.genreButton,
                    selectedGenre === null && styles.genreButtonActive
                  ]}
                  onPress={() => setSelectedGenre(null)}
                >
                  <Text style={[
                    styles.genreButtonText,
                    selectedGenre === null && styles.genreButtonTextActive
                  ]}>
                    All ({favorites.length})
                  </Text>
                </Pressable>
                
                {genres.map((genre) => {
                  const count = getFavoritesByGenre(genre).length;
                  return (
                    <Pressable
                      key={genre}
                      style={[
                        styles.genreButton,
                        selectedGenre === genre && styles.genreButtonActive
                      ]}
                      onPress={() => setSelectedGenre(genre)}
                    >
                      <Text style={[
                        styles.genreButtonText,
                        selectedGenre === genre && styles.genreButtonTextActive
                      ]}>
                        {genre} ({count})
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Movies List */}
          <ScrollView style={styles.moviesContainer}>
            <MovieList 
              movies={displayMovies}
              showFavoriteButton={true}
              emptyMessage={
                selectedGenre 
                  ? `No ${selectedGenre} movies in favorites`
                  : "No favorite movies"
              }
            />
          </ScrollView>
        </>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
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
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  clearButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  clearButtonText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  genreScrollContainer: {
    paddingRight: 20,
  },
  genreButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  genreButtonActive: {
    backgroundColor: '#007AFF',
  },
  genreButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  genreButtonTextActive: {
    color: '#fff',
  },
  moviesContainer: {
    flex: 1,
  },
});
