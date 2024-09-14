import { ProcessedModelData } from "@/types";
import { columns, formatters } from "@table/constants";
import { TableCell } from "./TableCell";

interface TableRowProps {
  model: ProcessedModelData;
  isFavorite: boolean;
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

export function TableRow({
  model,
  isFavorite,
  toggleFavorite,
  handleDeleteRow,
  editingCell,
  editValue,
  handleCellClick,
  handleCellEdit,
  handleCellEditComplete,
  formatValue,
  handleRowClick,
}: TableRowProps) {
  return (
    <tr className={`hover:bg-gray-50 ${isFavorite ? "bg-yellow-50" : ""}`}>
      {/* Favorite toggle cell */}
      <TableCell
        className="hidden cursor-pointer whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500 md:table-cell md:p-2 lg:text-lg"
        onClick={() => toggleFavorite(model.id)}
      >
        {isFavorite ? "★" : "☆"}
      </TableCell>

      {/* Data cells */}
      {columns.map((column) => (
        <TableCell
          key={`${model.id}-${column.key}`}
          className={`sm:p0 whitespace-nowrap text-center text-gray-900 hover:underline sm:text-sm md:p-2 md:px-2 md:py-2 md:text-base xl:px-6 xl:text-base ${column.responsiveClasses}`}
          isEditing={
            editingCell?.id === model.id && editingCell?.key === column.key
          }
          editValue={editValue}
          onEdit={handleCellEdit}
          onEditComplete={handleCellEditComplete}
          onDoubleClick={() =>
            handleCellClick(
              model.id,
              column.key as keyof ProcessedModelData,
              model[column.key as keyof ProcessedModelData],
            )
          }
          onClick={() => column.key === "name" && handleRowClick(model)}
        >
          {formatValue(
            model[column.key as keyof ProcessedModelData],
            column.format,
          )}
        </TableCell>
      ))}

      {/* Delete button cell */}
      <TableCell
        className="hidden items-center whitespace-nowrap px-6 py-4 text-sm text-gray-500 md:table-cell md:p-2"
        onClick={() => handleDeleteRow(model.id)}
      >
        <span className="cursor-pointer text-red-600 hover:text-red-900">
          Delete
        </span>
      </TableCell>
    </tr>
  );
}
