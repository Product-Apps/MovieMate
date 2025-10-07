// components/movie/MovieList.tsx (Simplified - No nested FlatList)
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Movie } from '@/types/movie';
import MovieCard from './MovieCard';
import { LoadingSpinner } from '../ui/LoadingSpinner';

const { width } = Dimensions.get('window');

interface MovieListProps {
  movies: Movie[];
  loading?: boolean;
  error?: string | null;
  numColumns?: number;
  showFavoriteButton?: boolean;
  emptyMessage?: string;
  contentContainerStyle?: any;
}

export default function MovieList({
  movies = [],
  loading = false,
  error = null,
  numColumns = 2,
  showFavoriteButton = true,
  emptyMessage = 'No movies found',
  contentContainerStyle,
}: MovieListProps) {
  const safeMovies = Array.isArray(movies) ? movies.filter(Boolean) : [];

  if (loading) {
    return (
      <View style={[styles.centerContainer, contentContainerStyle]}>
        <LoadingSpinner />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, contentContainerStyle]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (safeMovies.length === 0) {
    return (
      <View style={[styles.centerContainer, contentContainerStyle]}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, contentContainerStyle]}>
      <View style={styles.grid}>
        {safeMovies.map((movie, index) => (
          <View 
            key={movie.id} 
            style={[
              styles.movieItemContainer,
              index % numColumns !== numColumns - 1 && styles.movieItemMargin
            ]}
          >
            <MovieCard movie={movie} showFavoriteButton={showFavoriteButton} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  movieItemContainer: {
    width: (width - 60) / 2,
    marginBottom: 16,
  },
  movieItemMargin: {
    marginRight: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
});
