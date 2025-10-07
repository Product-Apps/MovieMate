// app/(tabs)/puzzles.tsx (Enhanced with Mini-Games and Color Picker)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useMoodStore } from '@/store/useMoodStore';
import { usePuzzleState } from '@/hooks/usePuzzleState';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import ColorPicker from '@/components/puzzle/ColorPicker';
import WordAssociation from '@/components/puzzle/WordAssociation';
import LogicMaze from '@/components/puzzle/LogicMaze';
import PatternRecognition from '@/components/puzzle/PatternRecognition';
import EmojiMoodSlider from '@/components/puzzle/EmojiMoodSlider';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const ENHANCED_PUZZLE_QUESTIONS = [
  {
    id: 'mood_intro',
    type: 'welcome' as const,
    question: 'Welcome to Your Mood Journey!',
    description: 'Let\'s discover what kind of movies match your current state of mind through fun activities.',
    moodWeights: {},
  },
  {
    id: 'color_picker',
    type: 'color-picker' as const,
    question: 'Which colors resonate with you right now?',
    description: 'Pick 3-5 colors that represent how you\'re feeling.',
    moodWeights: {
      // Colors will map to moods in the component
    },
  },
  {
    id: 'emoji_slider',
    type: 'emoji-slider' as const,
    question: 'How would you describe your energy level?',
    description: 'Slide to match your current vibe.',
    moodWeights: {
      energetic: 0.8,
      excited: 0.6,
      calm: -0.4,
      melancholic: -0.6,
    },
  },
  {
    id: 'word_association',
    type: 'word-association' as const,
    question: 'Quick! What\'s the first thing that comes to mind?',
    description: 'Choose words that feel right in the moment.',
    words: ['Adventure', 'Cozy', 'Excitement', 'Peace', 'Mystery', 'Romance', 'Laughter', 'Tears'],
    moodWeights: {
      adventurous: 1,
      calm: 1,
      excited: 1,
      contemplative: 1,
      mysterious: 1,
      romantic: 1,
      happy: 1,
      sad: 1,
    },
  },
  {
    id: 'pattern_recognition',
    type: 'pattern-recognition' as const,
    question: 'Which pattern speaks to you?',
    description: 'Trust your instincts and pick the pattern that feels right.',
    moodWeights: {
      // Patterns will map to moods in the component
    },
  },
  {
    id: 'logic_maze',
    type: 'logic-maze' as const,
    question: 'Navigate through this mini maze',
    description: 'Your path choices reveal your decision-making mood.',
    moodWeights: {
      // Maze choices will map to moods
    },
  },
  {
    id: 'movie_preference',
    type: 'multiple-choice' as const,
    question: 'If you could step into any movie scene right now, which would it be?',
    description: 'Choose the scenario that appeals to you most.',
    options: [
      { id: 'action', text: 'An epic battle scene with heroes saving the day', value: 1, emoji: '⚡' },
      { id: 'romance', text: 'A romantic sunset confession of love', value: 1, emoji: '💕' },
      { id: 'comedy', text: 'A hilarious dinner party with friends', value: 1, emoji: '😂' },
      { id: 'mystery', text: 'Solving a thrilling mystery in an old mansion', value: 1, emoji: '🔍' },
      { id: 'drama', text: 'A deep conversation about life\'s meaning', value: 1, emoji: '🎭' },
    ],
    moodWeights: {
      excited: 1,
      romantic: 1,
      happy: 1,
      mysterious: 1,
      contemplative: 1,
    },
  },
  {
    id: 'final_mood_check',
    type: 'multiple-choice' as const,
    question: 'After all these activities, how are you feeling?',
    description: 'This helps us fine-tune your recommendations.',
    options: [
      { id: 'refreshed', text: 'Refreshed and ready for something new', value: 1, emoji: '✨' },
      { id: 'thoughtful', text: 'Thoughtful and introspective', value: 1, emoji: '🤔' },
      { id: 'excited', text: 'Excited and energized', value: 1, emoji: '🚀' },
      { id: 'peaceful', text: 'Peaceful and content', value: 1, emoji: '🕊️' },
      { id: 'curious', text: 'Curious and wanting to explore', value: 1, emoji: '🧭' },
    ],
    moodWeights: {
      optimistic: 1,
      contemplative: 1,
      excited: 1,
      calm: 1,
      adventurous: 1,
    },
  },
];

export default function PuzzlesScreen() {
  const router = useRouter();
  const { currentMoodAnalysis, isAnalyzing, resetPuzzleData } = useMoodStore();
  
  const safeQuestions = Array.isArray(ENHANCED_PUZZLE_QUESTIONS) ? ENHANCED_PUZZLE_QUESTIONS : [];
  
  const {
    currentQuestion,
    currentQuestionIndex,
    isCompleted,
    progress,
    submitResponse,
    goToPreviousQuestion,
    resetPuzzle,
    canGoBack,
    questionsRemaining,
  } = usePuzzleState(safeQuestions);

  const [selectedOption, setSelectedOption] = useState(null);
  const [sliderValue, setSliderValue] = useState(5);
  const [gameResponse, setGameResponse] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    setSelectedOption(null);
    setSliderValue(5);
    setGameResponse(null);
    if (currentQuestion?.type !== 'welcome') {
      setShowInstructions(false);
    }
  }, [currentQuestionIndex]);

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };

  const handleGameResponse = (response) => {
    setGameResponse(response);
  };

  const handleNext = async () => {
    if (!currentQuestion) return;

    let response;
    switch (currentQuestion.type) {
      case 'welcome':
        response = 'started';
        break;
      case 'emoji-slider':
        response = sliderValue;
        break;
      case 'multiple-choice':
        if (!selectedOption) {
          Alert.alert('Please select an option', 'Choose one of the options to continue.');
          return;
        }
        response = selectedOption;
        break;
      case 'color-picker':
      case 'word-association':
      case 'pattern-recognition':
      case 'logic-maze':
        if (!gameResponse) {
          Alert.alert('Please complete the activity', 'Finish the current activity to continue.');
          return;
        }
        response = gameResponse;
        break;
      default:
        return;
    }

    await submitResponse(response);
  };

  const handleStartOver = () => {
    Alert.alert(
      'Start Over?',
      'This will reset all your answers. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: resetPuzzle },
      ]
    );
  };

  const handleViewRecommendations = () => {
    router.push('/movies');
  };

  const renderGameComponent = () => {
    switch (currentQuestion?.type) {
      case 'color-picker':
        return (
          <ColorPicker
            onSelectionChange={handleGameResponse}
            maxSelections={5}
            minSelections={3}
          />
        );
      case 'word-association':
        return (
          <WordAssociation
            words={currentQuestion.words || []}
            onSelectionChange={handleGameResponse}
            maxSelections={3}
          />
        );
      case 'pattern-recognition':
        return (
          <PatternRecognition
            onSelectionChange={handleGameResponse}
          />
        );
      case 'logic-maze':
        return (
          <LogicMaze
            onComplete={handleGameResponse}
          />
        );
      case 'emoji-slider':
        return (
          <EmojiMoodSlider
            value={sliderValue}
            onValueChange={setSliderValue}
          />
        );
      default:
        return null;
    }
  };

  const renderMultipleChoice = () => {
    const options = Array.isArray(currentQuestion?.options) ? currentQuestion.options : [];
    
    return (
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.option,
              selectedOption === option.id && styles.selectedOption,
            ]}
            onPress={() => handleOptionSelect(option.id)}
          >
            {option.emoji && (
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
            )}
            <Text style={[
              styles.optionText,
              selectedOption === option.id && styles.selectedOptionText,
            ]}>
              {option.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderWelcome = () => (
    <View style={styles.welcomeContainer}>
      <View style={styles.welcomeContent}>
        <Ionicons name="happy" size={80} color="#007AFF" />
        <Text style={styles.welcomeTitle}>Mood Discovery Journey</Text>
        <Text style={styles.welcomeDescription}>
          We'll guide you through fun activities to understand your current mood and recommend perfect movies for you.
        </Text>
        <View style={styles.welcomeFeatures}>
          <View style={styles.feature}>
            <Ionicons name="color-palette" size={24} color="#FF6B6B" />
            <Text style={styles.featureText}>Color Psychology</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="game-controller" size={24} color="#4ECDC4" />
            <Text style={styles.featureText}>Mini Games</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="analytics" size={24} color="#45B7D1" />
            <Text style={styles.featureText}>Mood Analysis</Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (isAnalyzing) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.analyzingContainer}>
          <LoadingSpinner />
          <Text style={styles.analyzingText}>Analyzing your mood...</Text>
          <Text style={styles.analyzingSubtext}>
            Creating your personalized movie recommendations
          </Text>
        </View>
      </View>
    );
  }

  if (isCompleted && currentMoodAnalysis) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={[styles.resultsContainer, { paddingBottom: 120 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultsHeader}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            <Text style={styles.resultsTitle}>Mood Analysis Complete!</Text>
            <Text style={styles.resultsSubtitle}>
              Your personalized movie recommendations are ready
            </Text>
          </View>

          <Card style={styles.moodCard}>
            <Text style={styles.moodTitle}>Your Current Mood</Text>
            <Text style={styles.primaryMood}>
              {currentMoodAnalysis.primaryMood.charAt(0).toUpperCase() + 
               currentMoodAnalysis.primaryMood.slice(1)}
            </Text>
            <Text style={styles.confidence}>
              Confidence: {Math.round((currentMoodAnalysis.confidence || 0) * 100)}%
            </Text>
            
            {Array.isArray(currentMoodAnalysis.secondaryMoods) && currentMoodAnalysis.secondaryMoods.length > 0 && (
              <View style={styles.secondaryMoods}>
                <Text style={styles.secondaryTitle}>You're also feeling:</Text>
                <View style={styles.moodTags}>
                  {currentMoodAnalysis.secondaryMoods.slice(0, 3).map((mood, index) => (
                    <View key={index} style={styles.moodTag}>
                      <Text style={styles.moodTagText}>
                        {mood.charAt(0).toUpperCase() + mood.slice(1)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {currentMoodAnalysis.tags && currentMoodAnalysis.tags.length > 0 && (
              <View style={styles.tagsSection}>
                <Text style={styles.tagsTitle}>Perfect for movies that are:</Text>
                <View style={styles.tags}>
                  {currentMoodAnalysis.tags.slice(0, 6).map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Card>

          <View style={styles.actionsContainer}>
            <Button
              title="View My Recommendations"
              onPress={handleViewRecommendations}
              style={styles.primaryButton}
            />
            <Button
              title="Take Puzzle Again"
              onPress={handleStartOver}
              variant="outline"
              style={styles.secondaryButton}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mood Discovery</Text>
        {currentQuestion?.type !== 'welcome' && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Step {currentQuestionIndex + 1} of {safeQuestions.length}
            </Text>
            <ProgressBar progress={progress} style={styles.progressBar} />
          </View>
        )}
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.questionContainer, { paddingBottom: 160 }]}
        showsVerticalScrollIndicator={false}
      >
        {currentQuestion ? (
          <>
            {currentQuestion.type === 'welcome' ? (
              renderWelcome()
            ) : (
              <Card style={styles.questionCard}>
                <Text style={styles.questionTitle}>{currentQuestion.question}</Text>
                {currentQuestion.description && (
                  <Text style={styles.questionDescription}>
                    {currentQuestion.description}
                  </Text>
                )}
              </Card>
            )}

            {currentQuestion.type === 'multiple-choice' && renderMultipleChoice()}
            {['color-picker', 'word-association', 'pattern-recognition', 'logic-maze', 'emoji-slider'].includes(currentQuestion.type) && renderGameComponent()}
          </>
        ) : (
          <View style={styles.noQuestionContainer}>
            <Text style={styles.noQuestionText}>No questions available</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.navigationContainer}>
        <Button
          title="Previous"
          onPress={goToPreviousQuestion}
          variant="outline"
          disabled={!canGoBack}
          style={styles.navButton}
          size="small"
        />
        <Text style={styles.remainingText}>
          {questionsRemaining} remaining
        </Text>
        <Button
          title={questionsRemaining === 0 ? 'Analyze Mood' : 'Next'}
          onPress={handleNext}
          style={styles.navButton}
          size="small"
          disabled={
            (currentQuestion?.type === 'multiple-choice' && !selectedOption) ||
            (['color-picker', 'word-association', 'pattern-recognition', 'logic-maze'].includes(currentQuestion?.type) && !gameResponse) ||
            !currentQuestion
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    marginHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  questionContainer: {
    padding: 20,
    flexGrow: 1,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  welcomeContent: {
    alignItems: 'center',
    maxWidth: width - 80,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  welcomeFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  questionCard: {
    marginBottom: 24,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 28,
  },
  questionDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  selectedOptionText: {
    color: '#007AFF',
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 110,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    minWidth: 80,
  },
  remainingText: {
    fontSize: 14,
    color: '#666',
  },
  noQuestionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noQuestionText: {
    fontSize: 16,
    color: '#666',
  },
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  analyzingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  analyzingSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  resultsContainer: {
    padding: 20,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  resultsSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  moodCard: {
    alignItems: 'center',
    marginBottom: 30,
  },
  moodTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  primaryMood: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  confidence: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  secondaryMoods: {
    width: '100%',
    marginBottom: 16,
  },
  secondaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  moodTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  moodTagText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  tagsSection: {
    width: '100%',
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  actionsContainer: {
    gap: 12,
  },
  primaryButton: {
    marginBottom: 8,
  },
  secondaryButton: {
    marginBottom: 8,
  },
});
