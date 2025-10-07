// app/mood-history.tsx (New Screen)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useMoodStore } from '@/store/useMoodStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function MoodHistoryScreen() {
  const router = useRouter();
  const { moodHistory, clearMoodHistory } = useMoodStore();
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // all, week, month

  const safeMoodHistory = Array.isArray(moodHistory) ? moodHistory : [];

  const getFilteredHistory = () => {
    if (selectedPeriod === 'all') return safeMoodHistory;
    
    const now = Date.now();
    const periodMs = selectedPeriod === 'week' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
    
    return safeMoodHistory.filter(entry => now - entry.timestamp < periodMs);
  };

  const getMoodColor = (mood: string) => {
    const colors = {
      happy: '#FFD700',
      sad: '#4A90E2',
      excited: '#FF6B6B',
      calm: '#4ECDC4',
      anxious: '#FF9F43',
      romantic: '#FD79A8',
      nostalgic: '#DDA0DD',
      adventurous: '#00D2D3',
      mysterious: '#5F27CD',
      thoughtful: '#6C5CE7',
      energetic: '#FECA57',
      melancholic: '#636E72',
      optimistic: '#96CEB4',
      contemplative: '#A29BFE',
    };
    return colors[mood] || '#ccc';
  };

  const renderMoodEntry = ({ item, index }) => (
    <Card style={styles.moodEntry}>
      <View style={styles.moodHeader}>
        <View style={styles.moodIndicator}>
          <View style={[styles.moodDot, { backgroundColor: getMoodColor(item.primaryMood) }]} />
          <Text style={styles.moodName}>
            {item.primaryMood.charAt(0).toUpperCase() + item.primaryMood.slice(1)}
          </Text>
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={styles.confidence}>
        Confidence: {Math.round((item.confidence || 0) * 100)}%
      </Text>
      
      {item.secondaryMoods && item.secondaryMoods.length > 0 && (
        <View style={styles.secondaryMoods}>
          <Text style={styles.secondaryLabel}>Also: </Text>
          {item.secondaryMoods.slice(0, 2).map((mood, idx) => (
            <View key={idx} style={styles.secondaryMoodTag}>
              <Text style={styles.secondaryMoodText}>
                {mood.charAt(0).toUpperCase() + mood.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      )}
      
      {item.movieRecommendations && (
        <Text style={styles.recommendationsCount}>
          {item.movieRecommendations.length} movies recommended
        </Text>
      )}
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="analytics-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Mood History</Text>
      <Text style={styles.emptyDescription}>
        Complete mood puzzles to start tracking your emotional journey
      </Text>
      <Button
        title="Take Mood Puzzle"
        onPress={() => router.push('/puzzles')}
        style={styles.puzzleButton}
      />
    </View>
  );

  const filteredHistory = getFilteredHistory();

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mood History</Text>
        <View style={styles.headerRight} />
      </View>

      {safeMoodHistory.length > 0 && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Show:</Text>
          <View style={styles.filterButtons}>
            {[
              { key: 'all', label: 'All Time' },
              { key: 'month', label: 'Last Month' },
              { key: 'week', label: 'Last Week' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterButton,
                  selectedPeriod === option.key && styles.activeFilterButton,
                ]}
                onPress={() => setSelectedPeriod(option.key)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedPeriod === option.key && styles.activeFilterButtonText,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <FlatList
        data={filteredHistory}
        keyExtractor={(item, index) => `mood-${item.timestamp}-${index}`}
        renderItem={renderMoodEntry}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  moodEntry: {
    marginBottom: 16,
  },
  moodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  moodName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
  },
  confidence: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  secondaryMoods: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  secondaryMoodTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
  },
  secondaryMoodText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  recommendationsCount: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  puzzleButton: {
    paddingHorizontal: 32,
  },
});
