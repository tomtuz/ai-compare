import { useState, useCallback } from "react";
import { ProcessedModelData } from "@/types";
import { useAPIService } from "@/services/APIService";

export const useEditCell = () => {
  const [editingCell, setEditingCell] = useState<{
    id: string;
    key: keyof ProcessedModelData;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const { updateUserModel } = useAPIService();

  // Handle cell click for editing
  const handleCellClick = useCallback(
    (id: string, key: keyof ProcessedModelData, value: any) => {
      setEditingCell({ id, key });
      setEditValue(value.toString());
    },
    [],
  );

  // Handle cell edit
  const handleCellEdit = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditValue(e.target.value);
    },
    [],
  );

  // Complete cell edit
  const handleCellEditComplete = useCallback(
    (data: ProcessedModelData[]) => {
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
    },
    [editingCell, editValue, updateUserModel],
  );

  return {
    editingCell,
    editValue,
    handleCellClick,
    handleCellEdit,
    handleCellEditComplete,
  };
};
