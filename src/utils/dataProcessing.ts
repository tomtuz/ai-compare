import type { AIModel } from "@/services/APIService";

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

export interface UserModelData {
  id: string;
  [key: string]: any;
}

/**
 * Processes raw AI model data into a standardized format
 * @param {AIModel} model - The raw AI model data
 * @returns {ProcessedModelData} The processed model data
 */
export function processModelData(model: AIModel): ProcessedModelData {
  const inputCost = Number.parseFloat(model.pricing?.prompt ?? "0") || 0;
  const outputCost = Number.parseFloat(model.pricing?.completion ?? "0") || 0;
  const maxOutput = model.top_provider?.max_completion_tokens ?? 0;
  const contextSize = model.top_provider?.context_length ?? 0;

  return {
    id: model.id,
    name: model.name,
    inputCost,
    outputCost,
    maxOutput,
    contextSize,
    efficiencyScore: calculateEfficiencyScore(
      inputCost,
      outputCost,
      maxOutput,
      contextSize,
    ),
    source: "openrouter",
    isModified: false,
    originalData: model,
  };
}

/**
 * Calculates an efficiency score for an AI model
 * @param {number} inputCost - The input cost
 * @param {number} outputCost - The output cost
 * @param {number} maxOutput - The maximum output tokens
 * @param {number} contextSize - The context size
 * @returns {number} The calculated efficiency score (0-100)
 */
function calculateEfficiencyScore(
  inputCost: number,
  outputCost: number,
  maxOutput: number,
  contextSize: number,
): number {
  if (inputCost === 0 && outputCost === 0) {
    return 0;
  }

  // Avoid division by zero
  const totalCost = inputCost + outputCost || 1;
  const efficiency = (maxOutput * contextSize) / (totalCost * 1000);

  // Normalize the efficiency score to a 0-100 scale
  return Math.min(Math.max(efficiency * 10, 0), 100);
}

/**
 * Calculates the cost per 10 million tokens for an AI model
 * @param {AIModel} model - The AI model to calculate the cost for
 * @returns {number} The cost per 10 million tokens
 */
export function calculateCostPer10MTokens(model: AIModel): number {
  const inputCost = Number.parseFloat(model.pricing?.prompt ?? "0") || 0;
  const outputCost = Number.parseFloat(model.pricing?.completion ?? "0") || 0;

  if (inputCost === 0 && outputCost === 0) {
    return 0;
  }

  // Assuming an equal split between input and output tokens
  const averageCost = (inputCost + outputCost) / 2;

  return averageCost * 10000000; // Cost per 10 million tokens
}

/**
 * Merges OpenRouter data with user data
 * @param {ProcessedModelData[]} openRouterData - The processed OpenRouter data
 * @param {UserModelData[]} userData - The user-modified data
 * @returns {ProcessedModelData[]} The merged data
 */
export function mergeDataSources(
  openRouterData: ProcessedModelData[],
  userData: UserModelData[],
): ProcessedModelData[] {
  const mergedData = openRouterData.map((model) => {
    const userModel = userData.find((um) => um.id === model.id);
    if (userModel) {
      return {
        ...model,
        ...userModel,
        isModified: true,
        source: "openrouter" as const,
      };
    }
    return model;
  });

  // Add any user-created models
  const userCreatedModels = userData
    .filter((um) => !openRouterData.some((orm) => orm.id === um.id))
    .map((um) => ({
      ...processModelData({
        id: um.id,
        name: um.name || "User Created Model",
        created: Date.now(),
        description: um.description || "",
        context_length: um.contextSize || 0,
        architecture: {
          modality: "text->text",
          tokenizer: "Unknown",
          instruct_type: null,
        },
        pricing: {
          prompt: um.inputCost?.toString() || "0",
          completion: um.outputCost?.toString() || "0",
          image: "0",
          request: "0",
        },
        top_provider: {
          context_length: um.contextSize || 0,
          max_completion_tokens: um.maxOutput || 0,
          is_moderated: false,
        },
        per_request_limits: null,
      }),
      ...um,
      source: "user" as const,
      isModified: true,
    }));

  return [...mergedData, ...userCreatedModels];
}

/**
 * Sorts an array of ProcessedModelData based on a specified key
 * @param {ProcessedModelData[]} models - The array of models to sort
 * @param {keyof ProcessedModelData} sortBy - The key to sort by
 * @param {boolean} ascending - Whether to sort in ascending order
 * @returns {ProcessedModelData[]} The sorted array of models
 */
export function sortModels(
  models: ProcessedModelData[],
  sortBy: keyof ProcessedModelData,
  ascending: boolean,
): ProcessedModelData[] {
  return [...models].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    if (aValue != null && bValue != null) {
      if (aValue < bValue) return ascending ? -1 : 1;
      if (aValue > bValue) return ascending ? 1 : -1;
    }
    return 0;
  });
}

/**
 * Filters an array of ProcessedModelData based on specified filters
 * @param {ProcessedModelData[]} models - The array of models to filter
 * @param {Partial<ProcessedModelData>} filters - The filters to apply
 * @returns {ProcessedModelData[]} The filtered array of models
 */
export function filterModels(
  models: ProcessedModelData[],
  filters: Partial<ProcessedModelData>,
): ProcessedModelData[] {
  return models.filter((model) => {
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined) continue;
      const modelValue = model[key as keyof ProcessedModelData];
      if (typeof value === "string" && typeof modelValue === "string") {
        if (!modelValue.toLowerCase().includes(value.toLowerCase())) {
          return false;
        }
      } else if (modelValue !== value) {
        return false;
      }
    }
    return true;
  });
}
