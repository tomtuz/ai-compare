const formatters = {
  currency: (value: number | null | undefined) =>
    value != null ? `$${value.toFixed(2)}` : "N/A",
  number: (value: number | null | undefined) =>
    value != null ? value.toLocaleString() : "N/A",
  percentage: (value: number | null | undefined) =>
    value != null ? `${(value * 100).toFixed(2)}%` : "N/A",
  default: (value: any) => (value != null ? String(value) : "N/A"),
};

type ColumnTypes = {
  key: string;
  label: string;
  format?: keyof typeof formatters;
  responsiveClasses?: string;
};

const columns: ColumnTypes[] = [
  { key: "name", label: "Name", responsiveClasses: "" },
  {
    key: "inputCost",
    label: "Input Cost $/M",
    format: "currency",
    responsiveClasses: "",
  },
  {
    key: "outputCost",
    label: "Output Cost $/M",
    format: "currency",
    responsiveClasses: "",
  },
  {
    key: "maxOutput",
    label: "Max Output",
    format: "number",
    responsiveClasses: "hidden lg:table-cell",
  },
  {
    key: "contextSize",
    label: "Context Size",
    format: "number",
    responsiveClasses: "",
  },
  {
    key: "efficiencyScore",
    label: "Efficiency Score",
    format: "number",
    responsiveClasses: "",
  },
];

export { formatters, columns };
