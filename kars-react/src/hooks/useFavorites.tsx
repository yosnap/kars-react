import { useState, useEffect, useCallback, useContext, createContext, ReactNode } from "react";
import Cookies from "js-cookie";

const COOKIE_KEY = "motoraldia_favs";
const COOKIE_EXPIRE_DAYS = 365;

function getFavoritesFromCookie(): string[] {
  const raw = Cookies.get(COOKIE_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr;
    return [];
  } catch {
    return [];
  }
}

interface FavoritesContextProps {
  favorites: string[];
  isFavorite: (id: string) => boolean;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (id: string) => void;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextProps | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(getFavoritesFromCookie());

  useEffect(() => {
    Cookies.set(COOKIE_KEY, JSON.stringify(favorites), { expires: COOKIE_EXPIRE_DAYS });
  }, [favorites]);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const addFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      if (!prev.includes(id)) return prev;
      return prev.filter(fav => fav !== id);
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      if (prev.includes(id)) {
        return prev.filter(fav => fav !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite, clearFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites debe usarse dentro de FavoritesProvider");
  return ctx;
} 