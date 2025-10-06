import React from 'react';
import { StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useMoodStore } from '@/store/useMoodStore';
import { useMovieStore } from '@/store/useMovieStore';

export default function HomeScreen() {
  const router = useRouter();
  const { currentMoodAnalysis, resetPuzzleData } = useMoodStore();
  const { recommendations } = useMovieStore();

  const handleStartPuzzles = () => {
    resetPuzzleData();
    router.push('/puzzles');
  };

  const handleViewMovies = () => {
    if (recommendations.length === 0) {
      Alert.alert(
        'No Recommendations',
        'Complete the mood puzzles first to get personalized movie recommendations!',
        [
          { text: 'OK' },
          { text: 'Start Puzzles', onPress: handleStartPuzzles }
        ]
      );
      return;
    }
    router.push('/movies');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧩 MoodFlix</Text>
        <Text style={styles.subtitle}>
          Discover movies through interactive puzzles that reveal your mood
        </Text>
      </View>
      {/* Additional content... */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: 'center', opacity: 0.7 }
});
