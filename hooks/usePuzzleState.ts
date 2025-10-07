// hooks/usePuzzleState.ts
import { useState, useCallback } from 'react';
import { useMoodStore } from '@/store/useMoodStore';
import { PuzzleQuestion, PuzzleResponse } from '@/types/puzzle';
import { moodAnalyzer } from '@/services/moodAnalyzer';

export function usePuzzleState(questions: PuzzleQuestion[]) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const {
    responses,
    addResponse,
    setMoodAnalysis,
    setAnalyzing,
    updateCompletionPercentage,
    resetPuzzleData,
  } = useMoodStore();

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;

  const submitResponse = useCallback(
    async (response: string | number) => {
      if (!currentQuestion) return;

      const puzzleResponse: PuzzleResponse = {
        questionId: currentQuestion.id,
        response,
        timestamp: Date.now(),
      };

      addResponse(puzzleResponse);

      const newProgress = ((currentQuestionIndex + 1) / questions.length) * 100;
      updateCompletionPercentage(newProgress);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setIsCompleted(true);
        await analyzeMood();
      }
    },
    [currentQuestion, currentQuestionIndex, questions.length, addResponse, updateCompletionPercentage]
  );

  const analyzeMood = useCallback(async () => {
    setAnalyzing(true);
    
    try {
      const allResponses = [...responses];
      if (currentQuestion) {
        // Add the final response if it hasn't been added yet
        const finalResponse = allResponses.find(r => r.questionId === currentQuestion.id);
        if (!finalResponse) {
          // This shouldn't happen with the current flow, but just in case
          console.warn('Final response not found in responses array');
        }
      }
      
      const analysis = await moodAnalyzer.analyzeMood(allResponses, questions);
      setMoodAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing mood:', error);
    } finally {
      setAnalyzing(false);
    }
  }, [responses, questions, currentQuestion, setAnalyzing, setMoodAnalysis]);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
      setIsCompleted(false);
    }
  }, [questions.length]);

  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setIsCompleted(false);
    }
  }, [currentQuestionIndex]);

  const resetPuzzle = useCallback(() => {
    resetPuzzleData();
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
  }, [resetPuzzleData]);

  const getResponseForQuestion = useCallback(
    (questionId: string) => {
      return responses.find(r => r.questionId === questionId);
    },
    [responses]
  );

  return {
    currentQuestion,
    currentQuestionIndex,
    isCompleted,
    progress,
    responses,
    submitResponse,
    goToQuestion,
    goToPreviousQuestion,
    resetPuzzle,
    getResponseForQuestion,
    canGoBack: currentQuestionIndex > 0,
    questionsRemaining: questions.length - currentQuestionIndex - 1,
  };
}

export default usePuzzleState;
