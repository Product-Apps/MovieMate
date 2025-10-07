// components/puzzle/ColorPicker.tsx (New Mini-Game Component)
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const COLORS = [
  { color: '#FF6B6B', name: 'Passionate Red', mood: 'excited' },
  { color: '#4ECDC4', name: 'Calm Teal', mood: 'calm' },
  { color: '#45B7D1', name: 'Peaceful Blue', mood: 'contemplative' },
  { color: '#96CEB4', name: 'Refreshing Green', mood: 'optimistic' },
  { color: '#FECA57', name: 'Energetic Yellow', mood: 'happy' },
  { color: '#FF9FF3', name: 'Dreamy Pink', mood: 'romantic' },
  { color: '#54A0FF', name: 'Adventure Blue', mood: 'adventurous' },
  { color: '#5F27CD', name: 'Mysterious Purple', mood: 'mysterious' },
  { color: '#00D2D3', name: 'Creative Cyan', mood: 'energetic' },
  { color: '#FF9F43', name: 'Warm Orange', mood: 'happy' },
  { color: '#6C5CE7', name: 'Thoughtful Lavender', mood: 'contemplative' },
  { color: '#A29BFE', name: 'Gentle Violet', mood: 'calm' },
  { color: '#FD79A8', name: 'Playful Rose', mood: 'romantic' },
  { color: '#636E72', name: 'Melancholic Gray', mood: 'melancholic' },
  { color: '#2D3436', name: 'Deep Black', mood: 'mysterious' },
  { color: '#DDA0DD', name: 'Nostalgic Plum', mood: 'nostalgic' },
];

interface ColorPickerProps {
  onSelectionChange: (selection: any) => void;
  maxSelections: number;
  minSelections: number;
}

export default function ColorPicker({ onSelectionChange, maxSelections, minSelections }: ColorPickerProps) {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const handleColorSelect = (colorData: any) => {
    const newSelection = selectedColors.includes(colorData.color)
      ? selectedColors.filter(c => c !== colorData.color)
      : selectedColors.length < maxSelections
        ? [...selectedColors, colorData.color]
        : selectedColors;

    setSelectedColors(newSelection);
    
    if (newSelection.length >= minSelections) {
      const selectedColorData = COLORS.filter(c => newSelection.includes(c.color));
      const moodCounts = {};
      
      selectedColorData.forEach(colorData => {
        moodCounts[colorData.mood] = (moodCounts[colorData.mood] || 0) + 1;
      });
      
      onSelectionChange({
        colors: newSelection,
        dominantMood: Object.keys(moodCounts).reduce((a, b) => 
          moodCounts[a] > moodCounts[b] ? a : b
        ),
        moodDistribution: moodCounts,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.instruction}>
          Tap {minSelections}-{maxSelections} colors that speak to you
        </Text>
        <Text style={styles.counter}>
          {selectedColors.length}/{maxSelections} selected
        </Text>
      </View>
      
      <View style={styles.colorGrid}>
        {COLORS.map((colorData, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.colorCircle,
              { backgroundColor: colorData.color },
              selectedColors.includes(colorData.color) && styles.selectedColor,
            ]}
            onPress={() => handleColorSelect(colorData)}
          >
            {selectedColors.includes(colorData.color) && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {selectedColors.length >= minSelections && (
        <View style={styles.selectedColorsPreview}>
          <Text style={styles.previewTitle}>Your color palette:</Text>
          <View style={styles.previewColors}>
            {selectedColors.map((color, index) => (
              <View
                key={index}
                style={[styles.previewColor, { backgroundColor: color }]}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  instruction: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  counter: {
    fontSize: 14,
    color: '#666',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  colorCircle: {
    width: (width - 120) / 4,
    height: (width - 120) / 4,
    borderRadius: (width - 120) / 8,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedColor: {
    borderWidth: 4,
    borderColor: '#333',
    transform: [{ scale: 1.1 }],
  },
  checkmark: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedColorsPreview: {
    marginTop: 20,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  previewColors: {
    flexDirection: 'row',
    gap: 4,
  },
  previewColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
