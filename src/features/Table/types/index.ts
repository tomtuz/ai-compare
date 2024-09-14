import { AIModel } from "@/types";

// not realy just table type
export interface ProcessedModelData {
  id: string;
  name: string;
  inputCost: number;
  outputCost: number;
  maxOutput: number;
  contextSize: number;
  efficiencyScore: number;
  eloScore?: number;
  source: "openrouter" | "user";
  isModified: boolean;
  originalData?: AIModel;
}
