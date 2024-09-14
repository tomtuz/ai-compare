import { useState, useCallback } from "react";
import { ProcessedModelData, SortConfig } from "@/types";

export const useSort = () => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Handle sorting of table columns
  const handleSort = useCallback((key: keyof ProcessedModelData) => {
    setSortConfig((currentSort) => {
      if (currentSort && currentSort.key === key) {
        if (currentSort.direction === "asc") {
          return { key, direction: "desc" };
        }
        return null;
      }
      return { key, direction: "asc" };
    });
  }, []);

  return { sortConfig, handleSort };
};
