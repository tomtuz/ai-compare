import { useState } from "react";
import { PaginationConfig } from "@/types";

export const usePagination = () => {
  const [paginationConfig, setPaginationConfig] = useState<PaginationConfig>({
    currentPage: 1,
    rowsPerPage: 10,
  });

  return { paginationConfig, setPaginationConfig };
};
