// app/(tabs)/puzzles.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, Pressable, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useMoodStore } from '@/store/useMoodStore';
import { useMovieStore } from '@/store/useMovieStore';
import ColorHarmonyPuzzle from '@/components/puzzle/ColorHarmonyPuzzle';
import PatternCompletionPuzzle from '@/components/puzzle/PatternCompletionPuzzle';
import StoryContextPuzzle from '@/components/puzzle/StoryContextPuzzle';
import RhythmPuzzle from '@/components/puzzle/RhythmPuzzle';
import ImageAssociationPuzzle from '@/components/puzzle/ImageAssociationPuzzle';
import LanguageSelector from '@/components/movie/LanguageSelector';
import { PuzzleResponse } from '@/types/puzzle';
import { PUZZLES } from '@/constants/Puzzles';
import { moodAnalyzer } from '@/services/moodAnalyzer';

const { width } = Dimensions.get('window');

export default function PuzzlesScreen() {
  const router = useRouter();
  const { addPuzzleResponse, setAnalyzing, setMoodAnalysis, resetPuzzleData } = useMoodStore();
  const { selectedLanguages, setSelectedLanguages } = useMovieStore();

  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [responses, setResponses] = useState<PuzzleResponse[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [languageSelected, setLanguageSelected] = useState(false);

  const currentPuzzle = PUZZLES[currentPuzzleIndex];
  const progress = ((currentPuzzleIndex + 1) / PUZZLES.length) * 100;

  useEffect(() => {
    resetPuzzleData();
    if (selectedLanguages.length === 0) {
      setSelectedLanguages(['en']);
    }
  }, []);

  useEffect(() => {
    setStartTime(new Date());
    setSelectedOption('');
  }, [currentPuzzleIndex]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleLanguageConfirm = () => {
    if (selectedLanguages.length === 0) {
      Alert.alert('Select Language', 'Please select at least one language to continue.');
      return;
    }
    setLanguageSelected(true);
    setShowLanguageSelector(false);
  };

  const handleNext = () => {
    if (!languageSelected) {
      setShowLanguageSelector(true);
      return;
    }

    if (!selectedOption) {
      Alert.alert('Please select an option', 'Choose one of the options to continue.');
      return;
    }

    const response: PuzzleResponse = {
      puzzleId: currentPuzzle.id,
      selectedOption,
      responseTime: Date.now() - startTime.getTime(),
      timestamp: new Date(),
    };

    const newResponses = [...responses, response];
    setResponses(newResponses);
    addPuzzleResponse(response);

    if (currentPuzzleIndex < PUZZLES.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
    } else {
      handleComplete(newResponses);
    }
  };

  const handleComplete = (allResponses: PuzzleResponse[]) => {
    setAnalyzing(true);

    setTimeout(() => {
      const analysis = moodAnalyzer.analyzeMood(allResponses);
      setMoodAnalysis(analysis);
      setAnalyzing(false);
      router.replace('/movies');
    }, 1500);
  };

  const handleBack = () => {
    if (currentPuzzleIndex > 0) {
      setCurrentPuzzleIndex(currentPuzzleIndex - 1);
      const newResponses = responses.slice(0, -1);
      setResponses(newResponses);
      setSelectedOption(responses[responses.length - 1]?.selectedOption || '');
    } else {
      router.back();
    }
  };

  const renderPuzzle = () => {
    switch (currentPuzzle.type) {
      case 'color_harmony':
        return (
          <ColorHarmonyPuzzle
            options={currentPuzzle.options}
            onSelect={handleOptionSelect}
            selectedOption={selectedOption}
          />
        );
      case 'pattern_completion':
        return (
          <PatternCompletionPuzzle
            options={currentPuzzle.options}
            onSelect={handleOptionSelect}
            selectedOption={selectedOption}
          />
        );
      case 'story_context':
        return (
          <StoryContextPuzzle
            puzzle={currentPuzzle}
            onSelect={handleOptionSelect}
            selectedOption={selectedOption}
          />
        );
      case 'rhythm_matching':
        return (
          <RhythmPuzzle
            options={currentPuzzle.options}
            onSelect={handleOptionSelect}
            selectedOption={selectedOption}
          />
        );
      case 'image_association':
        return (
          <ImageAssociationPuzzle
            options={currentPuzzle.options}
            onSelect={handleOptionSelect}
            selectedOption={selectedOption}
          />
        );
      default:
        return (
          <View style={styles.puzzleContainer}>
            <Text style={styles.puzzleTitle}>{currentPuzzle.title}</Text>
            <Text style={styles.puzzleDescription}>{currentPuzzle.description}</Text>

            <View style={styles.optionsContainer}>
              {currentPuzzle.options.map((option) => (
                <Pressable
                  key={option.id}
                  style={[
                    styles.option,
                    selectedOption === option.id && styles.selectedOption,
                  ]}
                  onPress={() => handleOptionSelect(option.id)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedOption === option.id && styles.selectedOptionText,
                  ]}>
                    {option.text || option.label}
                  </Text>

                  {selectedOption === option.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentPuzzleIndex + 1} of {PUZZLES.length}
        </Text>
      </View>

      {!languageSelected && (
        <View style={styles.languagePrompt}>
          <Text style={styles.languagePromptText}>
            🌍 Please select your preferred movie language(s) first
          </Text>
          <Pressable 
            style={styles.languagePromptButton}
            onPress={() => setShowLanguageSelector(true)}
          >
            <Text style={styles.languagePromptButtonText}>Select Languages</Text>
          </Pressable>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderPuzzle()}
      </ScrollView>

      <View style={styles.navigation}>
        <Pressable 
          style={[styles.navButton, styles.backButton]} 
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>

        <Pressable 
          style={[
            styles.navButton, 
            styles.nextButton,
            (!selectedOption || !languageSelected) && styles.disabledButton
          ]} 
          onPress={handleNext}
          disabled={!selectedOption || !languageSelected}
        >
          <Text style={[
            styles.nextButtonText,
            (!selectedOption || !languageSelected) && styles.disabledButtonText
          ]}>
            {currentPuzzleIndex < PUZZLES.length - 1 ? 'Next →' : 'Complete'}
          </Text>
        </Pressable>
      </View>

      <LanguageSelector
        selectedLanguages={selectedLanguages}
        onLanguagesChange={setSelectedLanguages}
        visible={showLanguageSelector}
        onClose={handleLanguageConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  progressContainer: {
    padding: 20,
    paddingTop: 60,
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  languagePrompt: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  languagePromptText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 10,
    textAlign: 'center',
  },
  languagePromptButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  languagePromptButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  puzzleContainer: {
    padding: 20,
  },
  puzzleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  puzzleDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 15,
  },
  option: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  navigation: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#f0f0f0',
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#007AFF',
  },
  nextButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
  },
  disabledButtonText: {
    color: '#999',
  },
});