interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  isEditing?: boolean;
  editValue?: string;
  onEdit?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditComplete?: () => void;
  onDoubleClick?: () => void;
  onClick?: () => void;
}

export function TableCell({
  children,
  className,
  isEditing,
  editValue,
  onEdit,
  onEditComplete,
  onDoubleClick,
  onClick,
}: TableCellProps) {
  return (
    <td
      className={className}
      onDoubleClick={onDoubleClick}
      onClick={onClick}
    >
      {isEditing ? (
        // Render input field when editing
        <input
          type="text"
          value={editValue}
          onChange={onEdit}
          onBlur={onEditComplete}
          // autoFocus
          className="w-full p-1 border rounded"
        />
      ) : (
        // Render cell content when not editing
        children
      )}
    </td>
  );
}
