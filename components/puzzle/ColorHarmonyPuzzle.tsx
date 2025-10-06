import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import { PuzzleOption } from '@/types/puzzle';

interface ColorHarmonyPuzzleProps {
  options: PuzzleOption[];
  onSelect: (optionId: string) => void;
  selectedOption?: string;
}

const { width } = Dimensions.get('window');

export default function ColorHarmonyPuzzle({ 
  options, 
  onSelect, 
  selectedOption 
}: ColorHarmonyPuzzleProps) {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const handleSelect = (optionId: string) => {
    onSelect(optionId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        Choose the color combination that feels right to you
      </Text>
      
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <Pressable
            key={option.id}
            style={[
              styles.colorOption,
              selectedOption === option.id && styles.selectedOption,
            ]}
            onPress={() => handleSelect(option.id)}
            onPressIn={() => setHoveredOption(option.id)}
            onPressOut={() => setHoveredOption(null)}
          >
            <View style={styles.colorPalette}>
              {option.colors?.map((color, index) => (
                <View
                  key={index}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    index === 0 && styles.firstSwatch,
                    index === option.colors!.length - 1 && styles.lastSwatch,
                  ]}
                />
              ))}
            </View>
            
            {option.label && (
              <Text style={[
                styles.optionLabel,
                selectedOption === option.id && styles.selectedLabel,
              ]}>
                {option.label}
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
  container: { flex: 1, padding: 20 },
  instruction: { fontSize: 18, fontWeight: '500', textAlign: 'center', marginBottom: 30, color: '#333', lineHeight: 24 },
  optionsContainer: { flex: 1, justifyContent: 'space-around' },
  colorOption: { alignItems: 'center', padding: 15, borderRadius: 16, borderWidth: 2, borderColor: 'transparent', backgroundColor: '#f8f9fa', marginVertical: 8 },
  selectedOption: { borderColor: '#007AFF', backgroundColor: '#e3f2fd', transform: [{ scale: 1.02 }] },
  colorPalette: { flexDirection: 'row', borderRadius: 25, overflow: 'hidden', marginBottom: 10 },
  colorSwatch: { width: (width - 80) / 3 / 3, height: 50 },
  firstSwatch: { borderTopLeftRadius: 25, borderBottomLeftRadius: 25 },
  lastSwatch: { borderTopRightRadius: 25, borderBottomRightRadius: 25 },
  optionLabel: { fontSize: 14, fontWeight: '500', color: '#666', textAlign: 'center' },
  selectedLabel: { color: '#007AFF', fontWeight: '600' },
  checkmark: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center' },
  checkmarkText: { color: 'white', fontSize: 14, fontWeight: 'bold' }
});
