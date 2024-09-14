import { TableHeader } from "./TableHeader";
import { TableBody } from "./TableBody";
import { TablePagination } from "./TablePagination";
import { TableFilters } from "./TableFilters";
import { useModelListLogic } from "@table/hooks";

interface TableProps {
  modelListLogic: ReturnType<typeof useModelListLogic>;
}

export function Table({ modelListLogic }: TableProps) {
  // Destructure all necessary props and functions from modelListLogic
  const {
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
  } = modelListLogic;

  return (
    <div>
      {/* Render TableFilters component */}
      <TableFilters
        filter={filter}
        setFilter={setFilter}
        showOnlyFavorites={showOnlyFavorites}
        setShowOnlyFavorites={setShowOnlyFavorites}
        handleUndoDelete={handleUndoDelete}
        hasDeletedRows={deletedRows.length > 0}
      />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Render TableHeader component */}
          <TableHeader
            onSort={handleSort}
            sortConfig={sortConfig}
          />
          {/* Render TableBody component */}
          <TableBody
            filteredData={processedData}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            handleDeleteRow={handleDeleteRow}
            editingCell={editingCell}
            editValue={editValue}
            handleCellClick={handleCellClick}
            handleCellEdit={handleCellEdit}
            handleCellEditComplete={handleCellEditComplete}
            formatValue={formatValue}
            handleRowClick={handleRowClick}
          />
        </table>
      </div>
      {/* Render TablePagination component */}
      <TablePagination
        currentPage={paginationConfig.currentPage}
        rowsPerPage={paginationConfig.rowsPerPage}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(page) =>
          setPaginationConfig((prev) => ({ ...prev, currentPage: page }))
        }
        onRowsPerPageChange={(rows) =>
          setPaginationConfig((prev) => ({
            ...prev,
            rowsPerPage: rows,
            currentPage: 1,
          }))
        }
      />
    </div>
  );
}
