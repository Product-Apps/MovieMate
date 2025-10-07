// components/movie/MovieDetails.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '@/types/movie';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { useMovieStore } from '@/store/useMovieStore';
import { movieService } from '@/services/movieService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';

const { width, height } = Dimensions.get('window');

interface MovieDetailsProps {
  movieId: number;
}

export function MovieDetails({ movieId }: MovieDetailsProps) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { addFavorite, removeFavorite, isFavorite } = useFavoriteStore();
  const { addToRecentlyViewed } = useMovieStore();
  const isMovieFavorite = movie ? isFavorite(movie.id) : false;

  useEffect(() => {
    loadMovieDetails();
  }, [movieId]);

  const loadMovieDetails = async () => {
    setLoading(true);
    try {
      const [movieDetails, similar] = await Promise.all([
        movieService.getMovieDetails(movieId),
        movieService.getSimilarMovies(movieId),
      ]);

      if (movieDetails) {
        setMovie(movieDetails);
        addToRecentlyViewed(movieDetails);
      }
      setSimilarMovies(similar.slice(0, 10));
    } catch (error) {
      console.error('Error loading movie details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = () => {
    if (!movie) return;
    
    if (isMovieFavorite) {
      removeFavorite(movie.id);
    } else {
      addFavorite(movie);
    }
  };

  const handleWatchTrailer = () => {
    if (movie?.trailer_link) {
      Linking.openURL(movie.trailer_link);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!movie) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#ccc" />
        <Text style={styles.errorText}>Movie not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Backdrop Image */}
      <View style={styles.backdropContainer}>
        {movie.backdrop_path ? (
          <Image source={{ uri: movie.backdrop_path }} style={styles.backdrop} />
        ) : (
          <View style={[styles.backdrop, styles.placeholderBackdrop]}>
            <Ionicons name="film-outline" size={80} color="#ccc" />
          </View>
        )}
        <View style={styles.backdropOverlay} />
      </View>

      {/* Movie Info */}
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <View style={styles.posterContainer}>
            {movie.poster ? (
              <Image source={{ uri: movie.poster }} style={styles.poster} />
            ) : (
              <View style={[styles.poster, styles.placeholderPoster]}>
                <Ionicons name="film-outline" size={40} color="#ccc" />
              </View>
            )}
          </View>

          <View style={styles.movieInfo}>
            <Text style={styles.title}>{movie.title}</Text>
            <Text style={styles.year}>{movie.year}</Text>
            
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{movie.rating?.toFixed(1)}</Text>
              <Text style={styles.voteCount}>({movie.vote_count})</Text>
            </View>

            <View style={styles.genreContainer}>
              {movie.genre.slice(0, 3).map((genre, index) => (
                <View key={index} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title={isMovieFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            onPress={handleFavoriteToggle}
            variant={isMovieFavorite ? 'secondary' : 'primary'}
            icon={isMovieFavorite ? 'heart' : 'heart-outline'}
            style={styles.favoriteButton}
          />
          
          {movie.trailer_link && (
            <Button
              title="Watch Trailer"
              onPress={handleWatchTrailer}
              variant="outline"
              icon="play"
              style={styles.trailerButton}
            />
          )}
        </View>

        {/* Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overview}>{movie.plot || movie.overview}</Text>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Director:</Text>
            <Text style={styles.detailValue}>{movie.director}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Language:</Text>
            <Text style={styles.detailValue}>{movie.language.toUpperCase()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Release Date:</Text>
            <Text style={styles.detailValue}>{movie.release_date}</Text>
          </View>
        </View>

        {/* Cast */}
        {movie.cast.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cast</Text>
            <Text style={styles.castText}>{movie.cast.join(', ')}</Text>
          </View>
        )}

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Similar Movies</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.similarMoviesContainer}
            >
              {similarMovies.map((similarMovie) => (
                <TouchableOpacity
                  key={similarMovie.id}
                  style={styles.similarMovieCard}
                >
                  {similarMovie.poster ? (
                    <Image 
                      source={{ uri: similarMovie.poster }} 
                      style={styles.similarMoviePoster} 
                    />
                  ) : (
                    <View style={[styles.similarMoviePoster, styles.placeholderPoster]}>
                      <Ionicons name="film-outline" size={20} color="#ccc" />
                    </View>
                  )}
                  <Text style={styles.similarMovieTitle} numberOfLines={2}>
                    {similarMovie.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backdropContainer: {
    position: 'relative',
  },
  backdrop: {
    width: width,
    height: height * 0.3,
  },
  placeholderBackdrop: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  contentContainer: {
    padding: 20,
    marginTop: -50,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  posterContainer: {
    marginRight: 20,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  placeholderPoster: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  movieInfo: {
    flex: 1,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  year: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  voteCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  genreText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 12,
  },
  favoriteButton: {
    flex: 1,
  },
  trailerButton: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  overview: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    width: 100,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  castText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  similarMoviesContainer: {
    marginTop: 8,
  },
  similarMovieCard: {
    width: 100,
    marginRight: 16,
  },
  similarMoviePoster: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  similarMovieTitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
});

export default MovieDetails;
