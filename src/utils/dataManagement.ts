import {
  FilterConfig,
  PaginationConfig,
  ProcessedModelData,
  SortConfig,
} from "@/types";

// Sort data based on the provided sort configuration
export function sortData(
  data: ProcessedModelData[],
  sortConfig: SortConfig | null,
): ProcessedModelData[] {
  if (!sortConfig) return data;

  return [...data].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === undefined || bValue === undefined) return 0;
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
}

// Filter data based on the provided filter configuration
export function filterData(
  data: ProcessedModelData[],
  filterConfig: FilterConfig,
): ProcessedModelData[] {
  return data.filter((model) => {
    const matchesSearch = Object.values(model).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(filterConfig.searchTerm.toLowerCase()),
    );
    const matchesFavorite =
      !filterConfig.showOnlyFavorites ||
      filterConfig.favorites.includes(model.id);
    return matchesSearch && matchesFavorite;
  });
}

// Paginate data based on the provided pagination configuration
export function paginateData(
  data: ProcessedModelData[],
  paginationConfig: PaginationConfig,
): ProcessedModelData[] {
  const startIndex =
    (paginationConfig.currentPage - 1) * paginationConfig.rowsPerPage;
  return data.slice(startIndex, startIndex + paginationConfig.rowsPerPage);
}

// Process data by applying sorting, filtering, and pagination
export function processData(
  data: ProcessedModelData[],
  sortConfig: SortConfig | null,
  filterConfig: FilterConfig,
  paginationConfig: PaginationConfig,
): {
  processedData: ProcessedModelData[];
  totalItems: number;
  totalPages: number;
} {
  let processedData = sortData(data, sortConfig);
  processedData = filterData(processedData, filterConfig);
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / paginationConfig.rowsPerPage);
  processedData = paginateData(processedData, paginationConfig);

  return { processedData, totalItems, totalPages };
}
