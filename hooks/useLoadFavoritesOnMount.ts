import {useEffect} from "react";
import {useFavoriteStore} from "../store/useFavoriteStore";

export default function useLoadFavoritesOnMount() {
  const loadFavorites = useFavoriteStore((s) => s.loadFavorites);
  useEffect(() => {
    loadFavorites();
  }, []);
}
