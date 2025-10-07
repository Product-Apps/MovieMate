// app/favorites.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import MovieCard from '@/components/movie/MovieCard';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'expo-router';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, clearFavorites, getFavoritesByGenre } = useFavoriteStore();
  const [sortBy, setSortBy] = useState('recent'); // recent, title, year, rating

  const safeFavorites = Array.isArray(favorites) ? favorites : [];

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Favorites',
      'Are you sure you want to remove all your favorite movies?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: clearFavorites 
        },
      ]
    );
  };

  const handleSort = (sortType: string) => {
    setSortBy(sortType);
  };

  const getSortedFavorites = () => {
    const sorted = [...safeFavorites];
    
    switch (sortBy) {
      case 'title':
        return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'year':
        return sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'recent':
      default:
        return sorted.reverse(); // Most recently added first
    }
  };

  const sortedFavorites = getSortedFavorites();

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <View style={styles.headerRight} />
      </View>

      {safeFavorites.length > 0 && (
        <View style={styles.controlsContainer}>
          <Text style={styles.countText}>
            {safeFavorites.length} movie{safeFavorites.length !== 1 ? 's' : ''}
          </Text>
          
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Sort by:</Text>
            <View style={styles.sortButtons}>
              {[
                { key: 'recent', label: 'Recent' },
                { key: 'title', label: 'Title' },
                { key: 'year', label: 'Year' },
                { key: 'rating', label: 'Rating' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.sortButton,
                    sortBy === option.key && styles.activeSortButton,
                  ]}
                  onPress={() => handleSort(option.key)}
                >
                  <Text style={[
                    styles.sortButtonText,
                    sortBy === option.key && styles.activeSortButtonText,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title="Clear All"
            variant="outline"
            onPress={handleClearAll}
            style={styles.clearButton}
          />
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptyDescription}>
        Movies you mark as favorites will appear here
      </Text>
      <Button
        title="Discover Movies"
        onPress={() => router.push('/movies')}
        style={styles.discoverButton}
      />
    </View>
  );

  const renderMovieItem = ({ item, index }: { item: any; index: number }) => (
    <View style={[
      styles.movieContainer,
      index % 2 === 0 ? styles.movieContainerLeft : styles.movieContainerRight
    ]}>
      <MovieCard movie={item} showFavoriteButton={true} />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <FlatList
        data={sortedFavorites}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderMovieItem}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={sortedFavorites.length > 0 ? styles.row : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  listContent: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 40, // Balance the back button
  },
  controlsContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  countText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  sortContainer: {
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeSortButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeSortButtonText: {
    color: '#fff',
  },
  clearButton: {
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  discoverButton: {
    paddingHorizontal: 32,
  },
  movieContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  movieContainerLeft: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  movieContainerRight: {
    paddingLeft: 10,
    paddingRight: 20,
  },
});
