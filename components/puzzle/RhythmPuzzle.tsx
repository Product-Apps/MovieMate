// components/puzzle/RhythmPuzzle.tsx
import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { PuzzleOption } from '@/types/puzzle';

interface RhythmPuzzleProps {
  options: PuzzleOption[];
  onSelect: (optionId: string) => void;
  selectedOption?: string;
}

export default function RhythmPuzzle({ 
  options, 
  onSelect, 
  selectedOption 
}: RhythmPuzzleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        Choose the rhythm that resonates with you
      </Text>
      
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <Pressable
            key={option.id}
            style={[
              styles.rhythmOption,
              selectedOption === option.id && styles.selectedOption,
            ]}
            onPress={() => onSelect(option.id)}
          >
            <Text style={styles.rhythmText}>{option.text}</Text>
            {option.description && (
              <Text style={[
                styles.description,
                selectedOption === option.id && styles.selectedDescription,
              ]}>
                {option.description}
              </Text>
            )}
            
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
    gap: 15,
  },
  rhythmOption: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  rhythmText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  selectedDescription: {
    color: '#007AFF',
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