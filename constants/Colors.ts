// constants/Colors.ts
/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const MoodColors = {
  happy: '#FFF8E1',
  sad: '#E3F2FD',
  excited: '#FFE0B2',
  calm: '#E8F5E8',
  anxious: '#FFEBEE',
  romantic: '#FCE4EC',
  nostalgic: '#F3E5F5',
  adventurous: '#E0F2F1',
  mysterious: '#EEEEEE',
  thoughtful: '#E1F5FE',
  energetic: '#FFF3E0',
  melancholic: '#F1F8E9',
  optimistic: '#FFFDE7',
  contemplative: '#E8EAF6',
  default: '#f9f9f9',
};
