// components/puzzle/StoryContextPuzzle.tsx
import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { PuzzleQuestion } from '@/types/puzzle';

interface StoryContextPuzzleProps {
  puzzle: PuzzleQuestion;
  onSelect: (optionId: string) => void;
  selectedOption?: string;
}

export default function StoryContextPuzzle({ 
  puzzle, 
  onSelect, 
  selectedOption 
}: StoryContextPuzzleProps) {
  const scenario = puzzle.scenarios?.[0];

  if (!scenario) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>{puzzle.description}</Text>
      
      <View style={styles.scenarioBox}>
        <Text style={styles.scenarioText}>{scenario.text}</Text>
      </View>

      <Text style={styles.questionText}>How does this make you feel?</Text>
      
      <View style={styles.optionsContainer}>
        {scenario.options.map((option) => (
          <Pressable
            key={option.id}
            style={[
              styles.option,
              selectedOption === option.id && styles.selectedOption,
            ]}
            onPress={() => onSelect(option.id)}
          >
            <Text style={[
              styles.optionText,
              selectedOption === option.id && styles.selectedOptionText,
            ]}>
              {option.text}
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
    marginBottom: 20,
    color: '#333',
    lineHeight: 24,
  },
  scenarioBox: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  scenarioText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 15,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  optionText: {
    fontSize: 15,
    color: '#333',
  },
  selectedOptionText: {
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