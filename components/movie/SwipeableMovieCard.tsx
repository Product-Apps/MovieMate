// components/movie/SwipeableMovieCard.tsx (Corrected)
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Linking,
} from 'react-native';
import { Gesture, GestureDetector, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '@/types/movie';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { useMovieStore } from '@/store/useMovieStore';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 140;
const SWIPE_THRESHOLD = 50;

interface SwipeableMovieCardProps {
  movie: Movie;
}

export default function SwipeableMovieCard({ movie }: SwipeableMovieCardProps) {
  const router = useRouter();
  const { addFavorite, removeFavorite, isFavorite } = useFavoriteStore();
  const { addToWatchlist, addToRecentlyViewed } = useMovieStore();
  const [showActions, setShowActions] = useState(false);

  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const isMovieFavorite = isFavorite(movie.id);

  const handlePress = () => {
    addToRecentlyViewed(movie);
    router.push(`/movie/${movie.id}`);
  };

  const handleFavoriteToggle = () => {
    if (isMovieFavorite) {
      removeFavorite(movie.id);
    } else {
      addFavorite(movie);
    }
  };

  const handleWatchTrailer = async () => {
    if (movie.trailer_link) {
      try {
        await Linking.openURL(movie.trailer_link);
      } catch (error) {
        Alert.alert('Error', 'Could not open trailer');
      }
    } else {
      Alert.alert('No Trailer', 'Trailer not available for this movie');
    }
  };

  const handleAddToWatchlist = () => {
    addToWatchlist(movie);
    Alert.alert('Added to Watchlist', `${movie.title} has been added to your watchlist`);
  };

  const openStreamingApp = (platform: string) => {
    const streamingUrls = {
      netflix: `https://www.netflix.com/search?q=${encodeURIComponent(movie.title)}`,
      prime: `https://www.amazon.com/s?k=${encodeURIComponent(movie.title)}&i=prime-instant-video`,
      youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' full movie')}`,
    };

    const url = streamingUrls[platform];
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', `Could not open ${platform}`);
      });
    }
  };

  // New Gesture Handler using the modern API
  const panGesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(0.95);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      scale.value = withSpring(1);
      
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        if (event.translationX > 0) {
          // Swipe right - Add to favorites
          runOnJS(handleFavoriteToggle)();
        } else {
          // Swipe left - Add to watchlist
          runOnJS(handleAddToWatchlist)();
        }
      }
      
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value },
      ],
    };
  });

  const getAgeRatingColor = (rating: string) => {
    switch (rating) {
      case 'G': return '#4CAF50';
      case 'PG': return '#2196F3';
      case 'PG-13': return '#FF9800';
      case 'R': return '#F44336';
      default: return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <TouchableOpacity
            style={styles.cardContent}
            onPress={handlePress}
            onLongPress={() => setShowActions(!showActions)}
            activeOpacity={0.9}
          >
            <View style={styles.imageContainer}>
              {movie.poster ? (
                <Image source={{ uri: movie.poster }} style={styles.poster} />
              ) : (
                <View style={[styles.poster, styles.placeholderPoster]}>
                  <Ionicons name="film-outline" size={30} color="#ccc" />
                </View>
              )}
              
              {/* Overlays */}
              <View style={styles.overlayTop}>
                <View style={[styles.ageRatingBadge, { backgroundColor: getAgeRatingColor(movie.age_rating) }]}>
                  <Text style={styles.ageRatingText}>{movie.age_rating || 'PG'}</Text>
                </View>
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={handleFavoriteToggle}
                >
                  <Ionicons
                    name={isMovieFavorite ? 'heart' : 'heart-outline'}
                    size={20}
                    color={isMovieFavorite ? '#FF3B30' : 'rgba(255,255,255,0.8)'}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.overlayBottom}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text style={styles.rating}>{movie.rating?.toFixed(1) || 'N/A'}</Text>
                </View>
                {movie.language && (
                  <View style={styles.languageBadge}>
                    <Text style={styles.languageText}>{movie.language.toUpperCase()}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.movieInfo}>
              <Text style={styles.title} numberOfLines={2}>
                {movie.title}
              </Text>
              <Text style={styles.year}>{movie.year}</Text>
              
              {movie.genre && movie.genre.length > 0 && (
                <View style={styles.genreContainer}>
                  <Text style={styles.genre} numberOfLines={1}>
                    {movie.genre.slice(0, 2).join(', ')}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Quick Actions */}
          {showActions && (
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleWatchTrailer}
              >
                <Ionicons name="play" size={16} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleAddToWatchlist}
              >
                <Ionicons name="bookmark-outline" size={16} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openStreamingApp('netflix')}
              >
                <Text style={styles.actionButtonText}>N</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </GestureDetector>

      {/* Swipe Hints */}
      <View style={styles.swipeHints}>
        <View style={styles.swipeHint}>
          <Ionicons name="heart" size={12} color="#FF3B30" />
          <Text style={styles.swipeHintText}>Swipe right</Text>
        </View>
        <View style={styles.swipeHint}>
          <Text style={styles.swipeHintText}>Swipe left</Text>
          <Ionicons name="bookmark" size={12} color="#007AFF" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTop: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ageRatingBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ageRatingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  favoriteButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rating: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
  languageBadge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  languageText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
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
    marginBottom: 6,
  },
  genreContainer: {
    marginTop: 2,
  },
  genre: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '500',
  },
  quickActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'column',
    gap: 4,
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  swipeHints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  swipeHintText: {
    fontSize: 10,
    color: '#999',
  },
});
