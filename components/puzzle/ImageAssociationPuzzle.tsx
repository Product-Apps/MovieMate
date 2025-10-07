// components/puzzle/ImageAssociationPuzzle.tsx
import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { PuzzleOption } from '@/types/puzzle';

interface ImageAssociationPuzzleProps {
  options: PuzzleOption[];
  onSelect: (optionId: string) => void;
  selectedOption?: string;
}

export default function ImageAssociationPuzzle({ 
  options, 
  onSelect, 
  selectedOption 
}: ImageAssociationPuzzleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        Which visual speaks to you?
      </Text>
      
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <Pressable
            key={option.id}
            style={[
              styles.imageOption,
              selectedOption === option.id && styles.selectedOption,
            ]}
            onPress={() => onSelect(option.id)}
          >
            <Text style={styles.emoji}>{option.text?.split(' ')[0]}</Text>
            <Text style={[
              styles.optionLabel,
              selectedOption === option.id && styles.selectedLabel,
            ]}>
              {option.text?.substring(2)}
            </Text>
            
            {selectedOption === option.id && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  instruction: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
    lineHeight: 24,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  imageOption: {
    width: '48%',
    aspectRatio: 1,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  selectedLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});