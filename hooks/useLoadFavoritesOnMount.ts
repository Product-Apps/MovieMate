// hooks/useLoadFavoritesOnMount.ts
import { useEffect } from 'react';
import { useFavoriteStore } from '@/store/useFavoriteStore';

export function useLoadFavoritesOnMount() {
  const { favorites } = useFavoriteStore();

  useEffect(() => {
    // This hook can be used to perform any initialization logic
    // when favorites are loaded. Currently, the favorites are
    // automatically persisted and loaded by Zustand.
    console.log(`Loaded ${favorites.length} favorites`);
  }, [favorites.length]);

  return { favoritesCount: favorites.length };
}

export default useLoadFavoritesOnMount;
