// components/ui/TabBarBackground.tsx
import { BlurView } from 'expo-blur';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

export default function TabBarBackground() {
  return <BlurView tint="systemChromeMaterial" intensity={100} style={StyleSheet.absoluteFill} />;
}
