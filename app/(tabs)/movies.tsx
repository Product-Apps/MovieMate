// app/(tabs)/movies.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, Pressable, FlatList, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useMovieStore } from '@/store/useMovieStore';
import { useMoodStore } from '@/store/useMoodStore';
import { Movie, MovieRecommendation } from '@/types/movie';
import { moodAnalyzer } from '@/services/moodAnalyzer';
import { recommendationEngine } from '@/services/movieRecommendationEngine';
import { LANGUAGES } from '@/constants/Languages';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

export default function MoviesScreen() {
  const router = useRouter();
  const { 
    recommendations, 
    setRecommendations, 
    setLoading: setMovieLoading,
    selectedLanguages,
  } = useMovieStore();
  const { currentMoodAnalysis, puzzleResponses, setMoodAnalysis } = useMoodStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (puzzleResponses.length > 0) {
      generateRecommendations();
    }
  }, [puzzleResponses]);

  const generateRecommendations = async () => {
    setLoading(true);
    setMovieLoading(true);
    setError(null);

    try {
      let moodAnalysis = currentMoodAnalysis;

      if (!moodAnalysis && puzzleResponses.length > 0) {
        moodAnalysis = moodAnalyzer.analyzeMood(puzzleResponses);
        setMoodAnalysis(moodAnalysis);
      }

      if (!moodAnalysis) {
        throw new Error('Unable to analyze mood');
      }

      const movieRecommendations = await recommendationEngine.generateRecommendations(
        moodAnalysis,
        puzzleResponses,
        selectedLanguages.length > 0 ? selectedLanguages : ['en'],
        20
      );

      setRecommendations(movieRecommendations);
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError('Failed to generate recommendations. Please try again.');
    } finally {
      setLoading(false);
      setMovieLoading(false);
    }
  };

  const handleMoviePress = (movie: Movie) => {
    router.push(`/movie/${movie.id}`);
  };

  const handleRetry = () => {
    setError(null);
    generateRecommendations();
  };

  const getSelectedLanguageNames = () => {
    return LANGUAGES
      .filter((lang) => selectedLanguages.includes(lang.code))
      .map((lang) => lang.name)
      .join(', ');
  };

  const renderMovieCard = ({ item }: { item: MovieRecommendation }) => (
    <Pressable
      style={styles.movieCard}
      onPress={() => handleMoviePress(item.movie)}
    >
      <Image
        source={{ uri: item.movie.poster || 'https://via.placeholder.com/300x450/cccccc/666666?text=No+Poster' }}
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
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>🎬 Analyzing your mood...</Text>
        <Text style={styles.loadingSubtext}>Finding perfect movies for you</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>😕 Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
        <Pressable 
          style={styles.startButton}
          onPress={() => router.push('/puzzles')}
        >
          <Text style={styles.startButtonText}>Retake Puzzles</Text>
        </Pressable>
      </View>
    );
  }

  if (recommendations.length === 0 && puzzleResponses.length === 0) {
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
        <View style={styles.languageInfo}>
          <Text style={styles.languageInfoText}>
            🌍 Languages: {getSelectedLanguageNames()}
          </Text>
        </View>
      </View>

      {recommendations.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>
            No movies found for selected languages. Try retaking the puzzles with different language preferences.
          </Text>
        </View>
      ) : (
        <FlatList
          data={recommendations}
          renderItem={renderMovieCard}
          keyExtractor={(item) => item.movie.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.moviesList}
          scrollEnabled={false}
        />
      )}

      <View style={styles.actions}>
        <Pressable
          style={styles.retakeButtonBottom}
          onPress={() => router.push('/puzzles')}
        >
          <Text style={styles.retakeButtonBottomText}>🔄 Retake Puzzles</Text>
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
    marginBottom: 10,
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
  languageInfo: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
  },
  languageInfoText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
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
    marginTop: 20,
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 32,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    minWidth: 150,
    alignItems: 'center',
    marginBottom: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  noResultsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
  retakeButtonBottom: {
    borderWidth: 2,
    borderColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  retakeButtonBottomText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});