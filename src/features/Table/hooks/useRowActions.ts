import { useState, useCallback } from "react";
import { ProcessedModelData } from "@/types";
import { useAPIService } from "@/services/APIService";

export const useRowActions = () => {
  const [deletedRows, setDeletedRows] = useState<ProcessedModelData[]>([]);
  const { updateUserModel, deleteUserModel } = useAPIService();

  // Handle row deletion
  const handleDeleteRow = useCallback(
    (id: string, data: ProcessedModelData[]) => {
      const deletedRow = data.find((model) => model.id === id);
      if (deletedRow) {
        setDeletedRows((prev) => [...prev, deletedRow]);
        deleteUserModel(id);
      }
    },
    [deleteUserModel],
  );

  // Handle undo delete
  const handleUndoDelete = useCallback(() => {
    const lastDeleted = deletedRows[deletedRows.length - 1];
    if (lastDeleted) {
      updateUserModel(lastDeleted);
      setDeletedRows((prev) => prev.slice(0, -1));
    }
  }, [deletedRows, updateUserModel]);

  return { deletedRows, handleDeleteRow, handleUndoDelete };
};
