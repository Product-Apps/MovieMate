// components/puzzle/WordAssociation.tsx (New)
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface WordAssociationProps {
  words: string[];
  onSelectionChange: (selection: any) => void;
  maxSelections: number;
}

export default function WordAssociation({ words, onSelectionChange, maxSelections }: WordAssociationProps) {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  useEffect(() => {
    onSelectionChange({ selectedWords });
  }, [selectedWords]);

  const handleWordSelect = (word: string) => {
    setSelectedWords(prev => {
      if (prev.includes(word)) {
        return prev.filter(w => w !== word);
      }
      if (prev.length < maxSelections) {
        return [...prev, word];
      }
      return prev;
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        Select up to {maxSelections} words that resonate with you.
      </Text>
      <View style={styles.wordCloud}>
        {words.map((word, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.wordChip,
              selectedWords.includes(word) && styles.selectedWordChip,
            ]}
            onPress={() => handleWordSelect(word)}
          >
            <Text style={[
              styles.wordText,
              selectedWords.includes(word) && styles.selectedWordText,
            ]}>
              {word}
            </Text>
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
  },
  instruction: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  wordCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  wordChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedWordChip: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
    transform: [{ scale: 1.05 }],
  },
  wordText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedWordText: {
    color: '#fff',
  },
});
