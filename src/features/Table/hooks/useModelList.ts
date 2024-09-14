// native
import { useCallback } from "react";

// constants
import { formatters } from "@table/constants";

// utils
import { processData } from "@/utils/dataManagement";

// hooks
import { useSort } from "./useSort";
import { useFilter } from "./useFilter";
import { usePagination } from "./usePagination";
import { useRowActions } from "./useRowActions";
import { useEditCell } from "./useEditCell";

// types
import { ProcessedModelData } from "@/types";

export const useModelList = (data: ProcessedModelData[]) => {
  const { sortConfig, handleSort } = useSort();
  const {
    filter,
    setFilter,
    showOnlyFavorites,
    setShowOnlyFavorites,
    favorites,
    toggleFavorite,
    filterConfig,
  } = useFilter();
  const { paginationConfig, setPaginationConfig } = usePagination();
  const { deletedRows, handleDeleteRow, handleUndoDelete } = useRowActions();
  const {
    editingCell,
    editValue,
    handleCellClick,
    handleCellEdit,
    handleCellEditComplete,
  } = useEditCell();

  // Process data using the dataManagement utility
  const { processedData, totalItems, totalPages } = processData(
    data,
    sortConfig,
    filterConfig,
    paginationConfig,
  );

  // Get the full filtered and sorted data without pagination
  const fullProcessedData = processData(data, sortConfig, filterConfig, {
    currentPage: 1,
    rowsPerPage: data.length,
  }).processedData;

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

  return {
    allProcessedData: fullProcessedData,
    processedData,
    totalItems,
    totalPages,
    handleUndoDelete,
    deletedRows,
    handleDeleteRow: (id: string) => handleDeleteRow(id, data),
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
    handleCellEditComplete: () => handleCellEditComplete(data),
    formatValue,
    handleRowClick,
  };
};
