interface TableFiltersProps {
  filter: string;
  setFilter: (filter: string) => void;
  showOnlyFavorites: boolean;
  setShowOnlyFavorites: (show: boolean) => void;
  handleUndoDelete: () => void;
  hasDeletedRows: boolean;
}

export function TableFilters({
  filter,
  setFilter,
  showOnlyFavorites,
  setShowOnlyFavorites,
  handleUndoDelete,
  hasDeletedRows,
}: TableFiltersProps) {
  return (
    <div className="my-2 flex justify-between items-center">
      {/* Text filter input */}
      <div className="flex items-center">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter models..."
          className="rounded border p-2 mr-4"
        />
        {/* Favorites filter checkbox */}
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showOnlyFavorites}
            onChange={(e) => setShowOnlyFavorites(e.target.checked)}
            className="mr-2"
          />
          Show only favorites
        </label>
      </div>
      {/* Undo delete button */}
      {hasDeletedRows && (
        <button
          onClick={handleUndoDelete}
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          Undo Delete
        </button>
      )}
    </div>
  );
}
