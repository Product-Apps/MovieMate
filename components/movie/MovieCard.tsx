// components/movie/MovieCard.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '@/types/movie';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

interface MovieCardProps {
  movie: Movie;
  showFavoriteButton?: boolean;
}

export default function MovieCard({ movie, showFavoriteButton = true }: MovieCardProps) {
  const router = useRouter();
  const { addFavorite, removeFavorite, isFavorite } = useFavoriteStore();
  const isMovieFavorite = isFavorite(movie.id);

  const handlePress = () => {
    router.push(`/movie/${movie.id}`);
  };

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    if (isMovieFavorite) {
      removeFavorite(movie.id);
    } else {
      addFavorite(movie);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.imageContainer}>
        {movie.poster ? (
          <Image source={{ uri: movie.poster }} style={styles.poster} />
        ) : (
          <View style={styles.placeholderPoster}>
            <Ionicons name="film-outline" size={40} color="#ccc" />
          </View>
        )}
        
        {showFavoriteButton && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            testID="movie-favorite-button"
          >
            <Ionicons
              name={isMovieFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isMovieFavorite ? '#FF3B30' : 'rgba(255,255,255,0.8)'}
            />
          </TouchableOpacity>
        )}

        <View style={styles.ageRatingBadge}>
          <Text style={styles.ageRatingText}>{movie.age_rating || 'PG'}</Text>
        </View>
      </View>

      <View style={styles.movieInfo}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.title}
        </Text>
        <Text style={styles.year}>{movie.year}</Text>
        
        <View style={styles.genreContainer}>
          {movie.genre.slice(0, 2).map((genre, index) => (
            <View key={index} style={styles.genreTag}>
              <Text style={styles.genreText}>{genre}</Text>
            </View>
          ))}
        </View>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{movie.rating?.toFixed(1) || 'N/A'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: CARD_WIDTH * 1.5,
    backgroundColor: '#f0f0f0',
  },
  placeholderPoster: {
    width: '100%',
    height: CARD_WIDTH * 1.5,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ageRatingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ageRatingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  movieInfo: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
  },
  year: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  genreTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2,
  },
  genreText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
});
