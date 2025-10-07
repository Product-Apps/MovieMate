// services/moodAnalyzer.ts
import { MoodAnalysis, MoodType, PuzzleResponse } from '@/types/mood';
import { PuzzleQuestion } from '@/types/puzzle';

export const moodAnalyzer = {
  analyzeMood: async (
    responses: PuzzleResponse[],
    questions: PuzzleQuestion[]
  ): Promise<MoodAnalysis> => {
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const moodScores: Record<MoodType, number> = {
      happy: 0,
      sad: 0,
      excited: 0,
      calm: 0,
      anxious: 0,
      romantic: 0,
      nostalgic: 0,
      adventurous: 0,
      mysterious: 0,
      thoughtful: 0,
      energetic: 0,
      melancholic: 0,
      optimistic: 0,
      contemplative: 0,
    };

    // Calculate mood scores based on responses
    responses.forEach(response => {
      const question = questions.find(q => q.id === response.questionId);
      if (!question) return;

      Object.entries(question.moodWeights).forEach(([mood, weight]) => {
        if (mood in moodScores) {
          const responseValue = typeof response.response === 'number' 
            ? response.response 
            : parseFloat(response.response as string) || 1;
          
          moodScores[mood as MoodType] += weight * responseValue;
        }
      });
    });

    // Normalize scores
    const maxScore = Math.max(...Object.values(moodScores));
    if (maxScore > 0) {
      Object.keys(moodScores).forEach(mood => {
        moodScores[mood as MoodType] = moodScores[mood as MoodType] / maxScore;
      });
    }

    // Find primary and secondary moods
    const sortedMoods = Object.entries(moodScores)
      .sort(([, a], [, b]) => b - a)
      .map(([mood]) => mood as MoodType);

    const primaryMood = sortedMoods[0];
    const secondaryMoods = sortedMoods.slice(1, 4);
    const confidence = moodScores[primaryMood];

    // Generate tags based on mood
    const tags = generateMoodTags(primaryMood, secondaryMoods);

    // Calculate energy and valence
    const energy = calculateEnergyLevel(moodScores);
    const valence = calculateValence(moodScores);

    return {
      primaryMood,
      secondaryMoods,
      confidence,
      tags,
      energy,
      valence,
      arousal: energy, // Using energy as arousal for simplicity
    };
  },
};

function generateMoodTags(primary: MoodType, secondary: MoodType[]): string[] {
  const moodTagMap: Record<MoodType, string[]> = {
    happy: ['joyful', 'upbeat', 'cheerful', 'positive'],
    sad: ['melancholy', 'emotional', 'tearjerker', 'poignant'],
    excited: ['thrilling', 'energetic', 'dynamic', 'intense'],
    calm: ['peaceful', 'relaxing', 'serene', 'gentle'],
    anxious: ['tense', 'suspenseful', 'edge-of-seat', 'nervous'],
    romantic: ['love', 'heartwarming', 'passionate', 'intimate'],
    nostalgic: ['vintage', 'classic', 'reminiscent', 'timeless'],
    adventurous: ['epic', 'journey', 'exploration', 'quest'],
    mysterious: ['enigmatic', 'puzzle', 'intrigue', 'suspense'],
    thoughtful: ['philosophical', 'deep', 'contemplative', 'meaningful'],
    energetic: ['fast-paced', 'dynamic', 'high-energy', 'action-packed'],
    melancholic: ['bittersweet', 'wistful', 'somber', 'reflective'],
    optimistic: ['hopeful', 'inspiring', 'uplifting', 'motivational'],
    contemplative: ['meditative', 'introspective', 'reflective', 'profound'],
  };

  const tags = [...moodTagMap[primary]];
  
  secondary.forEach(mood => {
    tags.push(...moodTagMap[mood].slice(0, 2));
  });

  return [...new Set(tags)].slice(0, 8);
}

function calculateEnergyLevel(moodScores: Record<MoodType, number>): number {
  const highEnergyMoods: MoodType[] = ['excited', 'energetic', 'happy', 'adventurous'];
  const lowEnergyMoods: MoodType[] = ['calm', 'contemplative', 'melancholic', 'sad'];

  let energyScore = 0.5; // Base neutral energy

  highEnergyMoods.forEach(mood => {
    energyScore += moodScores[mood] * 0.3;
  });

  lowEnergyMoods.forEach(mood => {
    energyScore -= moodScores[mood] * 0.3;
  });

  return Math.max(0, Math.min(1, energyScore));
}

function calculateValence(moodScores: Record<MoodType, number>): number {
  const positiveMoods: MoodType[] = ['happy', 'excited', 'optimistic', 'romantic'];
  const negativeMoods: MoodType[] = ['sad', 'anxious', 'melancholic'];

  let valenceScore = 0.5; // Base neutral valence

  positiveMoods.forEach(mood => {
    valenceScore += moodScores[mood] * 0.3;
  });

  negativeMoods.forEach(mood => {
    valenceScore -= moodScores[mood] * 0.3;
  });

  return Math.max(0, Math.min(1, valenceScore));
}

export default moodAnalyzer;
