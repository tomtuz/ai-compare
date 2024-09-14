import { useState, useEffect, useCallback } from "react";
import { FilterConfig } from "@/types";

export const useFilter = () => {
  const [filter, setFilter] = useState("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  // Toggle favorite status of a model
  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(id)
        ? prev.filter((fav) => fav !== id)
        : [...prev, id];
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  const filterConfig: FilterConfig = {
    searchTerm: filter,
    showOnlyFavorites,
    favorites,
  };

  return {
    filter,
    setFilter,
    showOnlyFavorites,
    setShowOnlyFavorites,
    favorites,
    toggleFavorite,
    filterConfig,
  };
};
