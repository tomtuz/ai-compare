import { useState, useEffect, useCallback } from "react";
import { ProcessedModelData } from "@/types";
import { useUpdateUserModel, useDeleteUserModel } from "@/services/APIService";
import { QueryClient } from "react-query";
import { formatters } from "@/constants/tableConstants";
import {
  SortConfig,
  FilterConfig,
  PaginationConfig,
  processData,
} from "@/utils/dataManagement";

export const useModelListLogic = (
  data: ProcessedModelData[],
  queryClient: QueryClient,
) => {
  // State declarations
  const [favorites, setFavorites] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<{
    id: string;
    key: keyof ProcessedModelData;
  } | null>(null);
  const [filter, setFilter] = useState("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [paginationConfig, setPaginationConfig] = useState<PaginationConfig>({
    currentPage: 1,
    rowsPerPage: 10,
  });
  const [editValue, setEditValue] = useState<string>("");
  const [deletedRows, setDeletedRows] = useState<ProcessedModelData[]>([]);

  // API hooks
  const updateUserModel = useUpdateUserModel(queryClient);
  const deleteUserModel = useDeleteUserModel(queryClient);

  // Filter configuration
  const filterConfig: FilterConfig = {
    searchTerm: filter,
    showOnlyFavorites,
    favorites,
  };

  // Process data using the dataManagement utility
  const { processedData, totalItems, totalPages } = processData(
    data,
    sortConfig,
    filterConfig,
    paginationConfig,
  );

  // Add this line to get the full filtered and sorted data without pagination
  const fullProcessedData = processData(data, sortConfig, filterConfig, {
    currentPage: 1,
    rowsPerPage: data.length,
  }).processedData;

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

  // Handle row deletion
  const handleDeleteRow = useCallback(
    (id: string) => {
      const deletedRow = data.find((model) => model.id === id);
      if (deletedRow) {
        setDeletedRows((prev) => [...prev, deletedRow]);
        deleteUserModel(id);
      }
    },
    [data, deleteUserModel],
  );

  // Handle undo delete
  const handleUndoDelete = useCallback(() => {
    const lastDeleted = deletedRows[deletedRows.length - 1];
    if (lastDeleted) {
      updateUserModel(lastDeleted);
      setDeletedRows((prev) => prev.slice(0, -1));
    }
  }, [deletedRows, updateUserModel]);

  // Handle sorting
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

  // Handle cell click for editing
  const handleCellClick = useCallback(
    (id: string, key: keyof ProcessedModelData, value: any) => {
      setEditingCell({ id, key });
      setEditValue(value.toString());
    },
    [],
  );

  // Handle cell edit
  const handleCellEdit = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditValue(e.target.value);
    },
    [],
  );

  // Complete cell edit
  const handleCellEditComplete = useCallback(() => {
    if (editingCell) {
      const { id, key } = editingCell;
      const updatedModel = data.find((model) => model.id === id);
      if (updatedModel) {
        const newValue = key === "name" ? editValue : Number(editValue);
        if (newValue !== updatedModel[key]) {
          updateUserModel({ ...updatedModel, [key]: newValue });
        }
      }
    }
    setEditingCell(null);
  }, [editingCell, editValue, data, updateUserModel]);

  // Format cell value
  const formatValue = useCallback(
    (value: any, format?: keyof typeof formatters) => {
      if (value == null) {
        return "N/A";
      }
      const formatter = format ? formatters[format] : formatters.default;
      return formatter(value);
    },
    [],
  );

  // Handle row click
  const handleRowClick = useCallback((model: ProcessedModelData) => {
    console.log("Row data:", model);
  }, []);

  // Return all necessary state and functions
  return {
    allProcessedData: fullProcessedData,
    processedData,
    totalItems,
    totalPages,
    handleUndoDelete,
    deletedRows,
    handleDeleteRow,
    favorites,
    toggleFavorite,
    filter,
    setFilter,
    showOnlyFavorites,
    setShowOnlyFavorites,
    sortConfig,
    handleSort,
    paginationConfig,
    setPaginationConfig,
    editingCell,
    editValue,
    handleCellClick,
    handleCellEdit,
    handleCellEditComplete,
    formatValue,
    handleRowClick,
  };
};
