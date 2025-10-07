// services/moodAnalyzer.ts
import { PuzzleResponse, PuzzleOption } from '@/types/puzzle';
import { MoodAnalysis, MoodScore } from '@/types/mood';
import { PUZZLES } from '@/constants/Puzzles';

export class MoodAnalyzer {
  analyzeMood(responses: PuzzleResponse[]): MoodAnalysis {
    const moodScores: MoodScore = {
      energetic: 0,
      calm: 0,
      happy: 0,
      nostalgic: 0,
      excited: 0,
      thoughtful: 0,
      romantic: 0,
      anxious: 0,
    };

    responses.forEach((response) => {
      const puzzle = PUZZLES.find((p) => p.id === response.puzzleId);
      if (!puzzle) return;

      let selectedOption: PuzzleOption | undefined;

      if (puzzle.options && puzzle.options.length > 0) {
        selectedOption = puzzle.options.find((opt) => opt.id === response.selectedOption);
      }

      if (puzzle.scenarios) {
        puzzle.scenarios.forEach((scenario) => {
          const scenarioOption = scenario.options.find((opt) => opt.id === response.selectedOption);
          if (scenarioOption) {
            selectedOption = scenarioOption;
          }
        });
      }

      if (selectedOption && selectedOption.mood_scores) {
        Object.entries(selectedOption.mood_scores).forEach(([mood, score]) => {
          if (mood in moodScores) {
            moodScores[mood as keyof MoodScore] += score;
          }
        });
      }
    });

    const totalScore = Object.values(moodScores).reduce((sum, score) => sum + score, 0);

    if (totalScore === 0) {
      return {
        primaryMood: 'happy',
        scores: moodScores,
        confidence: 0.5,
        description: 'Unable to determine mood clearly. Please try again.',
      };
    }

    const normalizedScores: MoodScore = {} as MoodScore;
    Object.keys(moodScores).forEach((key) => {
      normalizedScores[key as keyof MoodScore] = moodScores[key as keyof MoodScore] / totalScore;
    });

    const sortedMoods = Object.entries(normalizedScores)
      .sort(([, a], [, b]) => b - a)
      .map(([mood]) => mood);

    const primaryMood = sortedMoods[0];
    const secondaryMood = normalizedScores[sortedMoods[1] as keyof MoodScore] > 0.15 
      ? sortedMoods[1] 
      : undefined;

    const confidence = normalizedScores[primaryMood as keyof MoodScore];

    const description = this.generateDescription(
      primaryMood,
      secondaryMood,
      normalizedScores
    );

    return {
      primaryMood,
      secondaryMood,
      scores: normalizedScores,
      confidence,
      description,
    };
  }

  private generateDescription(
    primaryMood: string,
    secondaryMood: string | undefined,
    scores: MoodScore
  ): string {
    const descriptions: { [key: string]: string } = {
      energetic:
        "You're feeling full of energy and ready for action! High-energy movies with exciting plots will match your mood.",
      calm:
        "You're in a peaceful state of mind. Relaxing movies with slower pacing will help you unwind.",
      happy:
        "You're feeling joyful and upbeat! Feel-good movies with positive themes will enhance your mood.",
      nostalgic:
        "You're in a reflective, sentimental mood. Movies with meaningful stories will resonate with you.",
      excited:
        "You're feeling thrilled and eager for adventure! Action-packed movies will satisfy your excitement.",
      thoughtful:
        "You're in a contemplative state. Deep, thought-provoking movies will engage your mind.",
      romantic:
        "You're feeling loving and warm-hearted. Romantic movies will touch your emotions.",
      anxious:
        "You're feeling a bit tense. Comforting movies with positive outcomes will help you relax.",
    };

    let description = descriptions[primaryMood] || "Based on your responses, we've curated movies for you.";

    if (secondaryMood) {
      description += ` You also have hints of ${secondaryMood}, so we've included some variety.`;
    }

    return description;
  }
}

export const moodAnalyzer = new MoodAnalyzer();