import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';

const FAVORITES_STORAGE_KEY = 'favoriteProductIds';

interface FavoritesContextType {
  favoriteIds: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (raw) {
        const parsed: string[] = JSON.parse(raw);
        console.log('Loading favorites from localStorage:', parsed);
        setFavoriteIds(new Set(parsed));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when favorites change (but only after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    
    try {
      const arr = Array.from(favoriteIds);
      console.log('Saving favorites to localStorage:', arr);
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(arr));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favoriteIds, isLoaded]);

  const isFavorite = useCallback((productId: string) => {
    return favoriteIds.has(productId);
  }, [favoriteIds]);

  const toggleFavorite = useCallback((productId: string) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        console.log('Removed from favorites:', productId);
      } else {
        next.add(productId);
        console.log('Added to favorites:', productId);
      }
      console.log('Updated favorites:', Array.from(next));
      return next;
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setFavoriteIds(new Set());
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
    console.log('Cleared all favorites');
  }, []);

  const favoritesArray = useMemo(() => Array.from(favoriteIds), [favoriteIds]);

  const value = {
    favoriteIds: favoritesArray,
    isFavorite,
    toggleFavorite,
    clearFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
