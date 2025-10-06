import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, Pressable, FlatList, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useMovieStore } from '@/store/useMovieStore';
import { useMoodStore } from '@/store/useMoodStore';
import { Movie, MovieRecommendation } from '@/types/movie';
import { SAMPLE_MOVIES } from '@/constants/Movies';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

export default function MoviesScreen() {
  const router = useRouter();
  const { recommendations, setRecommendations } = useMovieStore();
  const { currentMoodAnalysis, puzzleResponses } = useMoodStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (puzzleResponses.length > 0 && recommendations.length === 0) {
      generateRecommendations();
    }
  }, [puzzleResponses]);

  const generateRecommendations = async () => {
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      // For demo purposes, we'll randomly select movies
      // In a real app, this would use the mood analysis to filter movies
      const shuffled = [...SAMPLE_MOVIES].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 8);

      const movieRecommendations: MovieRecommendation[] = selected.map((movie, index) => ({
        movie,
        matchScore: Math.random() * 40 + 60, // Random score between 60-100
        reason: getRecommendationReason(movie, currentMoodAnalysis?.primaryMood || 'happy')
      }));

      // Sort by match score
      movieRecommendations.sort((a, b) => b.matchScore - a.matchScore);

      setRecommendations(movieRecommendations);
      setLoading(false);
    }, 1500);
  };

  const getRecommendationReason = (movie: Movie, mood: string): string => {
    const reasons = {
      energetic: `Perfect for your high energy mood with exciting ${movie.genre[0]} elements`,
      calm: `Ideal for relaxation with its peaceful ${movie.genre[0]} storytelling`,
      happy: `Matches your upbeat mood with feel-good ${movie.genre[0]} vibes`,
      nostalgic: `Resonates with your reflective state through meaningful ${movie.genre[0]} themes`,
      excited: `Channels your excitement with thrilling ${movie.genre[0]} adventure`,
      thoughtful: `Complements your contemplative mood with deep ${movie.genre[0]} narrative`,
      romantic: `Perfect for your loving mood with beautiful ${movie.genre[0]} elements`,
      anxious: `Offers comfort and relief through uplifting ${movie.genre[0]} content`,
    };

    return reasons[mood as keyof typeof reasons] || `Great ${movie.genre[0]} choice for your current mood`;
  };

  const handleMoviePress = (movie: Movie) => {
    router.push(`/movie/${movie.id}`);
  };

  const renderMovieCard = ({ item }: { item: MovieRecommendation }) => (
    <Pressable
      style={styles.movieCard}
      onPress={() => handleMoviePress(item.movie)}
    >
      <Image
        source={{ uri: item.movie.poster }}
        style={styles.poster}
        resizeMode="cover"
      />
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={2}>
          {item.movie.title}
        </Text>
        <Text style={styles.movieYear}>{item.movie.year}</Text>
        <View style={styles.genreContainer}>
          {item.movie.genre.slice(0, 2).map((genre, index) => (
            <Text key={index} style={styles.genreTag}>
              {genre}
            </Text>
          ))}
        </View>
        <View style={styles.matchInfo}>
          <Text style={styles.matchScore}>
            {Math.round(item.matchScore)}% match
          </Text>
          <Text style={styles.rating}>⭐ {item.movie.rating}</Text>
        </View>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>🎬 Analyzing your mood...</Text>
        <Text style={styles.loadingSubtext}>Finding perfect movies for you</Text>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>🧩 No Recommendations Yet</Text>
        <Text style={styles.emptyText}>
          Complete the mood puzzles to get personalized movie recommendations!
        </Text>
        <Pressable 
          style={styles.startButton}
          onPress={() => router.push('/puzzles')}
        >
          <Text style={styles.startButtonText}>Start Puzzles</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎬 Your Movie Recommendations</Text>
        {currentMoodAnalysis && (
          <View style={styles.moodIndicator}>
            <Text style={styles.moodText}>
              Based on your {currentMoodAnalysis.primaryMood} mood
            </Text>
            <Text style={styles.confidenceText}>
              {Math.round(currentMoodAnalysis.confidence * 100)}% confidence
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={recommendations}
        renderItem={renderMovieCard}
        keyExtractor={(item) => item.movie.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.moviesList}
      />

      <View style={styles.actions}>
        <Pressable
          style={styles.retakeButton}
          onPress={() => router.push('/puzzles')}
        >
          <Text style={styles.retakeButtonText}>🔄 Retake Puzzles</Text>
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
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  moodIndicator: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  moodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  confidenceText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  moviesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  movieCard: {
    width: CARD_WIDTH,
    backgroundColor: '#f8f9fa',
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
  },
  poster: {
    width: '100%',
    height: CARD_WIDTH * 1.5,
    backgroundColor: '#e0e0e0',
  },
  movieInfo: {
    padding: 12,
  },
  movieTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  movieYear: {
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
    fontSize: 10,
    backgroundColor: '#e3f2fd',
    color: '#007AFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2,
  },
  matchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchScore: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  rating: {
    fontSize: 12,
    color: '#ff9800',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    minWidth: 150,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    padding: 20,
  },
  retakeButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
