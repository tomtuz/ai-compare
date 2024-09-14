import { columns } from "@table/constants";
import type { ProcessedModelData } from "@table/types";

interface TableHeaderProps {
  onSort: (key: keyof ProcessedModelData) => void;
  sortConfig: {
    key: keyof ProcessedModelData;
    direction: "asc" | "desc";
  } | null;
}

export function TableHeader({ onSort, sortConfig }: TableHeaderProps) {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell">
          Favorite
        </th>
        {columns.map((column) => (
          <th
            key={column.key}
            className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ${column.responsiveClasses}`}
            onClick={() => onSort(column.key as keyof ProcessedModelData)}
          >
            <div className="flex items-center cursor-pointer">
              {column.label}
              {sortConfig?.key === column.key && (
                <span className="ml-1">
                  {sortConfig.direction === "asc" ? "▲" : "▼"}
                </span>
              )}
            </div>
          </th>
        ))}
        <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell">
          Actions
        </th>
      </tr>
    </thead>
  );
}
