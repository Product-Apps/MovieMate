import { PuzzleQuestion } from '@/types/puzzle';

export const PUZZLES: PuzzleQuestion[] = [
  {
    id: 1,
    type: 'color_harmony',
    title: '🎨 Color Harmony',
    description: 'Choose color combinations that feel right to you',
    options: [
      {
        id: 'warm_energetic',
        label: 'Warm & Energetic',
        colors: ['#FF6B35', '#F7931E', '#FFD700'],
        mood_scores: { energetic: 3, excited: 2, happy: 1 }
      },
      {
        id: 'cool_calm',
        label: 'Cool & Calm',
        colors: ['#4A90E2', '#7ED321', '#50E3C2'],
        mood_scores: { calm: 3, peaceful: 2, happy: 1 }
      },
      {
        id: 'dark_moody',
        label: 'Dark & Moody',
        colors: ['#2C3E50', '#8E44AD', '#34495E'],
        mood_scores: { nostalgic: 2, thoughtful: 2, melancholic: 1 }
      },
      {
        id: 'bright_happy',
        label: 'Bright & Happy',
        colors: ['#E74C3C', '#F39C12', '#E67E22'],
        mood_scores: { happy: 3, excited: 2, energetic: 1 }
      },
      {
        id: 'muted_soft',
        label: 'Muted & Soft',
        colors: ['#95A5A6', '#BDC3C7', '#ECF0F1'],
        mood_scores: { anxious: 2, calm: 1, peaceful: 2 }
      }
    ]
  },
  {
    id: 2,
    type: 'pattern_completion',
    title: '🔧 Pattern Completion',
    description: 'Complete these patterns with the missing piece',
    options: [
      {
        id: 'angular_sharp',
        label: 'Angular & Sharp',
        text: '▲ ▲ ▲ - Strong geometric patterns',
        mood_scores: { energetic: 2, focused: 2, determined: 1 }
      },
      {
        id: 'curved_flowing',
        label: 'Curved & Flowing',
        text: '● ● ● - Smooth flowing patterns',
        mood_scores: { calm: 2, peaceful: 2, relaxed: 1 }
      },
      {
        id: 'chaotic_complex',
        label: 'Complex & Dynamic',
        text: '✦ ✧ ✦ - Complex abstract patterns',
        mood_scores: { anxious: 2, overwhelmed: 1, creative: 1 }
      },
      {
        id: 'symmetrical_ordered',
        label: 'Symmetrical & Ordered',
        text: '◆ ◇ ◆ - Perfect symmetrical patterns',
        mood_scores: { calm: 1, focused: 2, organized: 2 }
      }
    ]
  },
  {
    id: 3,
    type: 'story_context',
    title: '📚 Story Context',
    description: 'Choose the emotional context that resonates with you',
    scenarios: [
      {
        id: 'adventure_scene',
        text: 'A character stands at the edge of a cliff, looking at the vast landscape ahead...',
        options: [
          { id: 'excited_adventure', text: 'Excited for the adventure', mood_scores: { excited: 3, adventurous: 2 } },
          { id: 'peaceful_contemplation', text: 'Peaceful and contemplative', mood_scores: { calm: 2, thoughtful: 2 } },
          { id: 'anxious_unknown', text: 'Anxious about the unknown', mood_scores: { anxious: 3, worried: 1 } },
          { id: 'nostalgic_memories', text: 'Nostalgic for past journeys', mood_scores: { nostalgic: 3, melancholic: 1 } }
        ]
      }
    ],
    options: [] // Will use scenarios instead
  },
  {
    id: 4,
    type: 'rhythm_matching',
    title: '🎵 Rhythm Preference',
    description: 'Which rhythm feels right to you now?',
    options: [
      {
        id: 'fast_upbeat',
        text: 'Fast and energetic (♪♪♪♪)',
        description: 'High energy, exciting beats',
        mood_scores: { energetic: 3, excited: 2, upbeat: 2 }
      },
      {
        id: 'moderate_steady',
        text: 'Steady and balanced (♪ ♪ ♪ ♪)',
        description: 'Consistent, comfortable rhythm',
        mood_scores: { calm: 2, focused: 2, balanced: 1 }
      },
      {
        id: 'slow_peaceful',
        text: 'Slow and peaceful (♪   ♪   ♪)',
        description: 'Gentle, relaxing tempo',
        mood_scores: { calm: 3, peaceful: 2, relaxed: 2 }
      },
      {
        id: 'complex_irregular',
        text: 'Complex and varied (♪♪ ♪ ♪♪♪)',
        description: 'Dynamic, changing patterns',
        mood_scores: { thoughtful: 2, creative: 2, complex: 1 }
      }
    ]
  },
  {
    id: 5,
    type: 'image_association',
    title: '🖼️ Visual Association',
    description: 'Which image speaks to you?',
    pairs: [
      {
        id: 'nature_vs_city',
        option_a: {
          image: 'peaceful_nature',
          mood_scores: { calm: 2, peaceful: 2, natural: 1 }
        },
        option_b: {
          image: 'vibrant_city',
          mood_scores: { energetic: 2, excited: 1, social: 1 }
        }
      }
    ],
    options: [
      {
        id: 'nature_peaceful',
        text: '🌲 Peaceful forest scene',
        mood_scores: { calm: 2, peaceful: 2, natural: 1 }
      },
      {
        id: 'city_vibrant',
        text: '🏙️ Vibrant city lights',
        mood_scores: { energetic: 2, excited: 1, social: 1 }
      },
      {
        id: 'abstract_creative',
        text: '🎨 Abstract artistic expression',
        mood_scores: { creative: 2, thoughtful: 1, artistic: 2 }
      },
      {
        id: 'minimal_clean',
        text: '⬜ Clean minimal design',
        mood_scores: { calm: 2, focused: 2, organized: 1 }
      }
    ]
  }
];
