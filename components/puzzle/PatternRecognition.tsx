// components/puzzle/PatternRecognition.tsx (Fixed)
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// NOTE: The image assets could not be found, causing a bundling error.
// This component has been modified to use colored views as placeholders.
//
// To use images instead:
// 1. Create your pattern images (e.g., swirl.png) in the `assets/images/patterns/` folder.
// 2. Replace the `color` property below with `image: require('../../assets/images/patterns/swirl.png')`
//    (using the correct relative path from this file).
// 3. In the component's render method, replace the placeholder `<View>` with an `<Image>` component.

const PATTERNS = [
  { id: 'swirl', mood: 'contemplative', color: '#6C5CE7' },
  { id: 'grid', mood: 'calm', color: '#4ECDC4' },
  { id: 'burst', mood: 'excited', color: '#FF6B6B' },
  { id: 'organic', mood: 'happy', color: '#96CEB4' },
];

interface PatternRecognitionProps {
  onSelectionChange: (result: any) => void;
}

export default function PatternRecognition({ onSelectionChange }: PatternRecognitionProps) {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  const handleSelect = (pattern: any) => {
    setSelectedPattern(pattern.id);
    onSelectionChange({
      selectedPattern: pattern.id,
      mood: pattern.mood,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Which pattern appeals to you most?</Text>
      <View style={styles.patternGrid}>
        {PATTERNS.map((pattern) => (
          <TouchableOpacity
            key={pattern.id}
            style={[
              styles.patternCard,
              selectedPattern === pattern.id && styles.selectedPatternCard,
            ]}
            onPress={() => handleSelect(pattern)}
          >
            {/* Placeholder View */}
            <View style={[styles.patternPlaceholder, { backgroundColor: pattern.color }]} />

            {/* <Image source={pattern.image} style={styles.patternImage} /> */}
          </TouchableOpacity>
        ))}
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
  instruction: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  patternGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
  },
  patternCard: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  selectedPatternCard: {
    borderColor: '#007AFF',
    transform: [{ scale: 1.05 }],
  },
  patternPlaceholder: {
    width: '100%',
    height: '100%',
  },
  // Style for when you use images
  // patternImage: {
  //   width: '100%',
  //   height: '100%',
  //   resizeMode: 'cover',
  // },
});
