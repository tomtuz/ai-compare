import { ProcessedModelData } from "@/types";
import { TableRow } from "./TableRow";
import { formatters } from "@/constants/tableConstants";

interface TableBodyProps {
  filteredData: ProcessedModelData[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  handleDeleteRow: (id: string) => void;
  editingCell: { id: string; key: keyof ProcessedModelData } | null;
  editValue: string;
  handleCellClick: (
    id: string,
    key: keyof ProcessedModelData,
    value: any,
  ) => void;
  handleCellEdit: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCellEditComplete: () => void;
  formatValue: (value: any, format?: keyof typeof formatters) => string;
  handleRowClick: (model: ProcessedModelData) => void;
}

export function TableBody({
  filteredData,
  favorites,
  toggleFavorite,
  handleDeleteRow,
  editingCell,
  editValue,
  handleCellClick,
  handleCellEdit,
  handleCellEditComplete,
  formatValue,
  handleRowClick,
}: TableBodyProps) {
  return (
    <tbody className="divide-y divide-gray-200 bg-white">
      {/* Map through filtered data and render TableRow for each item */}
      {filteredData.map((model) => (
        <TableRow
          key={model.id}
          model={model}
          isFavorite={favorites.includes(model.id)}
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
      ))}
    </tbody>
  );
}
