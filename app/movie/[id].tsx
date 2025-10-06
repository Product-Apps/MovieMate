import React from 'react';
import { StyleSheet, ScrollView, View, Text, Image, Pressable, Linking, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SAMPLE_MOVIES } from '@/constants/Movies';

const { width } = Dimensions.get('window');

export default function MovieDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const movie = SAMPLE_MOVIES.find(m => m.id === parseInt(id as string));

  if (!movie) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Movie not found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleWatchTrailer = () => {
    if (movie.trailer_link) {
      Linking.openURL(movie.trailer_link);
    }
  };

  const handleStreamingPress = (platform: string) => {
    // In a real app, this would deep link to the streaming app
    console.log(`Opening ${platform} for ${movie.title}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: movie.poster }}
          style={styles.poster}
          resizeMode="cover"
        />
        <View style={styles.movieInfo}>
          <Text style={styles.title}>{movie.title}</Text>
          <Text style={styles.year}>{movie.year}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {movie.rating}</Text>
            <Text style={styles.language}>{movie.language}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plot</Text>
          <Text style={styles.plot}>{movie.plot}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genres</Text>
          <View style={styles.genreContainer}>
            {movie.genre.map((genre, index) => (
              <View key={index} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cast & Crew</Text>
          <View style={styles.creditsContainer}>
            <Text style={styles.creditLabel}>Director:</Text>
            <Text style={styles.creditValue}>{movie.director}</Text>
          </View>
          <View style={styles.creditsContainer}>
            <Text style={styles.creditLabel}>Cast:</Text>
            <Text style={styles.creditValue}>{movie.cast.join(', ')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mood Tags</Text>
          <View style={styles.moodTagContainer}>
            {movie.mood_tags.map((tag, index) => (
              <View key={index} style={styles.moodTag}>
                <Text style={styles.moodTagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Watch Now</Text>
          <View style={styles.streamingContainer}>
            {movie.streaming_platforms.map((platform, index) => (
              <Pressable
                key={index}
                style={styles.streamingButton}
                onPress={() => handleStreamingPress(platform)}
              >
                <Text style={styles.streamingText}>{platform}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable style={styles.trailerButton} onPress={handleWatchTrailer}>
          <Text style={styles.trailerButtonText}>🎬 Watch Trailer</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 100,
  },
  poster: {
    width: width * 0.4,
    height: width * 0.6,
    borderRadius: 12,
    marginRight: 20,
  },
  movieInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  year: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff9800',
  },
  language: {
    fontSize: 14,
    color: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  plot: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  genreText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  creditsContainer: {
    marginBottom: 8,
  },
  creditLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  creditValue: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  moodTagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moodTagText: {
    fontSize: 12,
    color: '#666',
  },
  streamingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  streamingButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  streamingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  trailerButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  trailerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#666',
  },
  backButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
