// app/favorites.tsx (Fixed - No nested ScrollView)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import MovieCard from '@/components/movie/MovieCard';

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

  const renderHeader = () => (
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
          <FlatList
            horizontal
            data={[{ id: 'all', name: 'All', count: favorites.length }, ...genres.map(g => ({ id: g, name: g, count: getFavoritesByGenre(g).length }))]}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.genreButton,
                  (item.id === 'all' && selectedGenre === null) || selectedGenre === item.id ? styles.genreButtonActive : null
                ]}
                onPress={() => setSelectedGenre(item.id === 'all' ? null : item.id)}
              >
                <Text style={[
                  styles.genreButtonText,
                  (item.id === 'all' && selectedGenre === null) || selectedGenre === item.id ? styles.genreButtonTextActive : null
                ]}>
                  {item.name} ({item.count})
                </Text>
              </Pressable>
            )}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.genreScrollContainer}
          />
        </View>
      )}
    </>
  );

  const renderEmpty = () => (
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
  );

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

      {/* Movies List */}
      <FlatList
        data={displayMovies}
        renderItem={({ item }) => <MovieCard movie={item} showFavoriteButton={true} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={favorites.length > 0 ? renderHeader : null}
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
  listContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
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
});
