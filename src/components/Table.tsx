import React, { useState, useEffect, useCallback } from "react";
import { ProcessedModelData } from "@/utils/dataProcessing";
import { useUpdateUserModel, useDeleteUserModel } from "@/services/APIService";
import { QueryClient } from "react-query";

interface TableProps {
  data: ProcessedModelData[];
  onSort: (key: keyof ProcessedModelData) => void;
  sortBy: keyof ProcessedModelData;
  sortAscending: boolean;
  queryClient: QueryClient;
}

export function Table({
  data,
  onSort,
  sortBy,
  sortAscending,
  queryClient,
}: TableProps) {
  const [editingCell, setEditingCell] = useState<{
    id: string;
    key: keyof ProcessedModelData;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [filter, setFilter] = useState("");
  const [filteredData, setFilteredData] = useState<ProcessedModelData[]>(data);
  const [deletedRows, setDeletedRows] = useState<ProcessedModelData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const updateUserModel = useUpdateUserModel(queryClient);
  const deleteUserModel = useDeleteUserModel(queryClient);

  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  useEffect(() => {
    let result = data;
    if (showOnlyFavorites) {
      result = result.filter((model) => favorites.includes(model.id));
    }
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      result = result.filter((model) => {
        return Object.entries(model).some(([, value]) => {
          if (typeof value === "string") {
            return value.toLowerCase().includes(lowerFilter);
          }
          if (typeof value === "number") {
            return value.toString().includes(lowerFilter);
          }
          return false;
        });
      });
    }
    setFilteredData(result);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [data, showOnlyFavorites, favorites, filter]);

  const handleCellClick = useCallback(
    (id: string, key: keyof ProcessedModelData, value: any) => {
      setEditingCell({ id, key });
      setEditValue(value.toString());
    },
    [],
  );

  const handleCellEdit = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditValue(e.target.value);
    },
    [],
  );

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

  const toggleFavorite = useCallback(
    (id: string) => {
      const newFavorites = favorites.includes(id)
        ? favorites.filter((fav) => fav !== id)
        : [...favorites, id];
      setFavorites(newFavorites);
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
    },
    [favorites],
  );

  const handleDeleteRow = useCallback(
    (id: string) => {
      const deletedRow = data.find((model) => model.id === id);
      if (deletedRow) {
        setDeletedRows((prev) => [...prev, deletedRow]);
        deleteUserModel(id);
        setFilteredData((prev) => prev.filter((model) => model.id !== id));
      }
    },
    [data, deleteUserModel],
  );

  const handleUndoDelete = useCallback(() => {
    const lastDeleted = deletedRows[deletedRows.length - 1];
    if (lastDeleted) {
      updateUserModel(lastDeleted);
      setDeletedRows((prev) => prev.slice(0, -1));
      setFilteredData((prev) => [...prev, lastDeleted]);
    }
  }, [deletedRows, updateUserModel]);

  const renderSortIndicator = useCallback(
    (key: keyof ProcessedModelData) => {
      return sortBy === key ? (sortAscending ? " ▲" : " ▼") : "";
    },
    [sortBy, sortAscending],
  );

  const renderHeaderCell = useCallback(
    (key: keyof ProcessedModelData, label: string) => (
      <th
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
        onClick={() => onSort(key)}
      >
        {label}
        {renderSortIndicator(key)}
      </th>
    ),
    [onSort, renderSortIndicator],
  );

  const renderCell = useCallback(
    (model: ProcessedModelData, key: keyof ProcessedModelData) => {
      const value = model[key];
      const isEditing =
        editingCell?.id === model.id && editingCell?.key === key;

      return (
        <td
          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
          onDoubleClick={() => handleCellClick(model.id, key, value)}
        >
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={handleCellEdit}
              onBlur={handleCellEditComplete}
              className="w-full p-1 border rounded"
            />
          ) : (
            <div className="group relative">
              {typeof value === "number" ? value.toFixed(6) : String(value)}
              <span className="hidden group-hover:block absolute z-10 p-2 bg-gray-800 text-white text-xs rounded shadow-lg">
                {key}: {String(value)}
              </span>
            </div>
          )}
        </td>
      );
    },
    [
      editingCell,
      editValue,
      handleCellClick,
      handleCellEdit,
      handleCellEditComplete,
    ],
  );

  const pageCount = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  return (
    <div className="flex flex-col">
      <div className="my-2 flex justify-between">
        <input
          type="text"
          placeholder="Filter models..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded"
        />
        <div>
          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showOnlyFavorites ? "Show All" : "Show Favorites"}
          </button>
          {deletedRows.length > 0 && (
            <button
              onClick={handleUndoDelete}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Undo Delete
            </button>
          )}
        </div>
      </div>
      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Favorite
                </th>
                {renderHeaderCell("name", "Name")}
                {renderHeaderCell("inputCost", "Input Cost")}
                {renderHeaderCell("outputCost", "Output Cost")}
                {renderHeaderCell("maxOutput", "Max Output")}
                {renderHeaderCell("contextSize", "Context Size")}
                {renderHeaderCell("efficiencyScore", "Efficiency Score")}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((model) => (
                <tr
                  key={model.id}
                  className={`hover:bg-gray-50 ${
                    favorites.includes(model.id) ? "bg-yellow-50" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button onClick={() => toggleFavorite(model.id)}>
                      {favorites.includes(model.id) ? "★" : "☆"}
                    </button>
                  </td>
                  {renderCell(model, "name")}
                  {renderCell(model, "inputCost")}
                  {renderCell(model, "outputCost")}
                  {renderCell(model, "maxOutput")}
                  {renderCell(model, "contextSize")}
                  {renderCell(model, "efficiencyScore")}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDeleteRow(model.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div>
          <span className="mr-2">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="border rounded p-1"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 border rounded mr-2 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {pageCount}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, pageCount))
            }
            disabled={currentPage === pageCount}
            className="px-2 py-1 border rounded ml-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
