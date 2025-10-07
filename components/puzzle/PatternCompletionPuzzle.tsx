// components/puzzle/PatternCompletionPuzzle.tsx
import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { PuzzleOption } from '@/types/puzzle';

interface PatternCompletionPuzzleProps {
  options: PuzzleOption[];
  onSelect: (optionId: string) => void;
  selectedOption?: string;
}

export default function PatternCompletionPuzzle({ 
  options, 
  onSelect, 
  selectedOption 
}: PatternCompletionPuzzleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        Choose the pattern that appeals to you most
      </Text>
      
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <Pressable
            key={option.id}
            style={[
              styles.patternOption,
              selectedOption === option.id && styles.selectedOption,
            ]}
            onPress={() => onSelect(option.id)}
          >
            <Text style={styles.patternSymbol}>{option.text}</Text>
            <Text style={[
              styles.optionLabel,
              selectedOption === option.id && styles.selectedLabel,
            ]}>
              {option.label}
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
    gap: 15,
  },
  patternOption: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  patternSymbol: {
    fontSize: 32,
    marginBottom: 10,
    color: '#333',
  },
  optionLabel: {
    fontSize: 14,
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