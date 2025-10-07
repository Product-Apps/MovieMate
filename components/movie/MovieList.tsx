// components/movie/MovieList.tsx
import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import MovieCard from './MovieCard';
import { Movie } from '@/types/movie';

interface MovieListProps {
  movies: Movie[];
  showFavoriteButton?: boolean;
  numColumns?: number;
  emptyMessage?: string;
}

export default function MovieList({ 
  movies, 
  showFavoriteButton = true, 
  numColumns = 2,
  emptyMessage = "No movies found" 
}: MovieListProps) {
  const renderMovie = ({ item }: { item: Movie }) => (
    <MovieCard movie={item} showFavoriteButton={showFavoriteButton} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{emptyMessage}</Text>
    </View>
  );

  return (
    <FlatList
      data={movies}
      renderItem={renderMovie}
      keyExtractor={(item) => item.id.toString()}
      numColumns={numColumns}
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      ListEmptyComponent={renderEmpty}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
