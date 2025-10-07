// components/puzzle/EmojiMoodSlider.tsx (New Component)
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const MOOD_EMOJIS = [
  { value: 1, emoji: '😴', label: 'Sleepy' },
  { value: 2, emoji: '😔', label: 'Down' },
  { value: 3, emoji: '😐', label: 'Meh' },
  { value: 4, emoji: '🙂', label: 'Okay' },
  { value: 5, emoji: '😊', label: 'Good' },
  { value: 6, emoji: '😄', label: 'Happy' },
  { value: 7, emoji: '🤩', label: 'Excited' },
  { value: 8, emoji: '🚀', label: 'Energetic' },
  { value: 9, emoji: '⚡', label: 'Electric' },
  { value: 10, emoji: '🔥', label: 'On Fire!' },
];

interface EmojiMoodSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

export default function EmojiMoodSlider({ value, onValueChange }: EmojiMoodSliderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Energy: {MOOD_EMOJIS[value - 1]?.label}</Text>
      <Text style={styles.currentEmoji}>{MOOD_EMOJIS[value - 1]?.emoji}</Text>
      
      <View style={styles.sliderContainer}>
        {MOOD_EMOJIS.map((mood, index) => (
          <TouchableOpacity
            key={mood.value}
            style={[
              styles.emojiButton,
              value >= mood.value && styles.activeEmojiButton,
            ]}
            onPress={() => onValueChange(mood.value)}
          >
            <Text style={[
              styles.emoji,
              value >= mood.value && styles.activeEmoji,
            ]}>
              {mood.emoji}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.labels}>
        <Text style={styles.label}>Low Energy</Text>
        <Text style={styles.label}>High Energy</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  currentEmoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  emojiButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  activeEmojiButton: {
    backgroundColor: '#007AFF',
    transform: [{ scale: 1.2 }],
  },
  emoji: {
    fontSize: 16,
    opacity: 0.5,
  },
  activeEmoji: {
    opacity: 1,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  label: {
    fontSize: 12,
    color: '#666',
  },
});
