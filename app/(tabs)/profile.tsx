import React from 'react';
import { StyleSheet, ScrollView, View, Text, Pressable, Switch } from 'react-native';
import { useUserStore } from '@/store/useUserStore';
import { useMoodStore } from '@/store/useMoodStore';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const { preferences, moodHistory, updatePreferences, clearUserData } = useUserStore();
  const { currentMoodAnalysis, resetPuzzleData } = useMoodStore();

  const handleToggleDarkMode = (value: boolean) => {
    updatePreferences({ darkMode: value });
  };

  const handleClearData = () => {
    clearUserData();
    resetPuzzleData();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👤 Profile</Text>
      </View>

      {/* Current Mood Section */}
      {currentMoodAnalysis && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Mood</Text>
          <View style={styles.moodCard}>
            <View style={styles.moodHeader}>
              <Text style={styles.moodType}>{currentMoodAnalysis.primaryMood}</Text>
              <Text style={styles.confidence}>
                {Math.round(currentMoodAnalysis.confidence * 100)}%
              </Text>
            </View>
            <Text style={styles.moodDescription}>
              {currentMoodAnalysis.description}
            </Text>
            {currentMoodAnalysis.secondaryMood && (
              <Text style={styles.secondaryMood}>
                Secondary: {currentMoodAnalysis.secondaryMood}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <Text style={styles.preferenceLabel}>Dark Mode</Text>
            <Text style={styles.preferenceDescription}>
              Switch between light and dark themes
            </Text>
          </View>
          <Switch
            value={preferences.darkMode}
            onValueChange={handleToggleDarkMode}
            trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
            thumbColor={preferences.darkMode ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <Text style={styles.preferenceLabel}>Favorite Languages</Text>
            <Text style={styles.preferenceDescription}>
              {preferences.favoriteLanguages.join(', ') || 'None selected'}
            </Text>
          </View>
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <Text style={styles.preferenceLabel}>Favorite Genres</Text>
            <Text style={styles.preferenceDescription}>
              {preferences.favoriteGenres.join(', ') || 'None selected'}
            </Text>
          </View>
        </View>
      </View>

      {/* Mood History Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mood History</Text>
        {moodHistory.length > 0 ? (
          <View style={styles.historyContainer}>
            {moodHistory.slice(0, 5).map((history, index) => (
              <View key={history.id} style={styles.historyItem}>
                <View style={styles.historyMood}>
                  <Text style={styles.historyMoodText}>
                    {history.analysis.primaryMood}
                  </Text>
                  <Text style={styles.historyDate}>
                    {formatDate(history.timestamp)}
                  </Text>
                </View>
                <Text style={styles.historyConfidence}>
                  {Math.round(history.analysis.confidence * 100)}%
                </Text>
              </View>
            ))}
            {moodHistory.length > 5 && (
              <Text style={styles.moreHistory}>
                +{moodHistory.length - 5} more entries
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.emptyHistory}>
            No mood history yet. Complete some puzzles to see your patterns!
          </Text>
        )}
      </View>

      {/* Actions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>

        <Pressable 
          style={styles.actionButton}
          onPress={() => router.push('/puzzles')}
        >
          <Text style={styles.actionButtonText}>🧩 Take New Mood Assessment</Text>
        </Pressable>

        <Pressable 
          style={styles.actionButton}
          onPress={() => router.push('/movies')}
        >
          <Text style={styles.actionButtonText}>🎬 View Movie Recommendations</Text>
        </Pressable>

        <Pressable 
          style={[styles.actionButton, styles.dangerButton]}
          onPress={handleClearData}
        >
          <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
            🗑️ Clear All Data
          </Text>
        </Pressable>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.appInfo}>MoodFlix v1.0.0</Text>
          <Text style={styles.appInfo}>
            AI-powered movie recommendations based on mood detection through interactive puzzles.
          </Text>
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
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  moodCard: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  moodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  moodType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    textTransform: 'capitalize',
  },
  confidence: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  moodDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  secondaryMood: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  preferenceText: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#666',
  },
  historyContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  historyMood: {
    flex: 1,
  },
  historyMoodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textTransform: 'capitalize',
  },
  historyDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  historyConfidence: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  moreHistory: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  emptyHistory: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  actionButton: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  dangerButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  dangerButtonText: {
    color: '#FF3B30',
  },
  appInfo: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
});
