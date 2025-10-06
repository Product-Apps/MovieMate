import { useColorScheme as _useColorScheme } from 'react-native';

export function useColorScheme() {
  return _useColorScheme() as NonNullable<ReturnType<typeof _useColorScheme>>;
}
