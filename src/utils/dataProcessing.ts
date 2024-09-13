import { mean, standardDeviation } from "simple-statistics";
import type { AIModel, ProcessedModelData, UserModelData } from "@/types";

const formatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 10,
  maximumFractionDigits: 10,
});

export function processAllModelData(models: AIModel[]): ProcessedModelData[] {
  const processedModels = models.map((model) => processModelData(model));
  return normalizeEfficiencyScores(processedModels);
}

export function processModelData(model: AIModel): ProcessedModelData {
  const { id, name, pricing, top_provider } = model;
  const inputCost = Number(pricing?.prompt) || 0;
  const outputCost = Number(pricing?.completion) || 0;
  const maxOutput = top_provider?.max_completion_tokens || 0;
  const contextSize = top_provider?.context_length || 0;

  const formatCost = (cost: number) =>
    cost > 0
      ? Number(formatter.format(cost * 1_000_000).replace(/,/g, ""))
      : cost;

  const rawEfficiencyScore = calculateRawEfficiencyScore(
    inputCost,
    outputCost,
    maxOutput,
    contextSize,
  );

  return {
    id,
    name,
    inputCost: formatCost(inputCost),
    outputCost: formatCost(outputCost),
    maxOutput,
    contextSize,
    efficiencyScore: rawEfficiencyScore, // Set initial efficiency score
    source: "openrouter" as const,
    isModified: false,
    originalData: model,
  };
}

export function calculateRawEfficiencyScore(
  inputCost: number,
  outputCost: number,
  maxOutput: number,
  contextSize: number,
): number {
  if (inputCost === 0 && outputCost === 0) {
    return 0;
  }

  const averageCost = (inputCost + outputCost) / 2;

  // Avoid division by zero and log of zero
  if (averageCost === 0 || maxOutput === 0 || contextSize === 0) {
    return 0;
  }

  const capability = Math.log(Math.max(1, maxOutput * contextSize));
  return capability / (averageCost * 1000000);
}

export function normalizeEfficiencyScores(
  models: ProcessedModelData[],
): ProcessedModelData[] {
  const rawScores = models.map((model) => model.efficiencyScore);

  const validScores = rawScores.filter(
    (score) => !Number.isNaN(score) && Number.isFinite(score) && score > 0,
  );

  if (validScores.length === 0) {
    return models.map((model) => ({ ...model, efficiencyScore: 0 }));
  }

  const meanScore = mean(validScores);
  const stdDev = standardDeviation(validScores);

  return models.map((model) => {
    if (
      Number.isNaN(model.efficiencyScore) ||
      !Number.isFinite(model.efficiencyScore) ||
      model.efficiencyScore <= 0
    ) {
      return { ...model, efficiencyScore: 0 };
    }

    const zScore = (model.efficiencyScore - meanScore) / (stdDev || 1); // Avoid division by zero
    const normalizedScore = Math.min(
      Math.max(((zScore + 3) / 6) * 100, 0),
      100,
    );

    return {
      ...model,
      efficiencyScore: Number(normalizedScore.toFixed(2)),
    };
  });
}

// Calculates the cost per 10 million tokens for an AI model
export function calculateCostPer10MTokens(model: AIModel): number {
  const inputCost = Number.parseFloat(model.pricing?.prompt ?? "0") || 0;
  const outputCost = Number.parseFloat(model.pricing?.completion ?? "0") || 0;

  if (inputCost === 0 && outputCost === 0) {
    return 0;
  }

  const averageCost = (inputCost + outputCost) / 2;
  return averageCost * 10000000;
}

// Merges OpenRouter data with user data
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

// Sorts an array of ProcessedModelData based on a specified key
export function sortModels(
  models: ProcessedModelData[],
  sortBy: keyof ProcessedModelData,
  ascending: boolean,
): ProcessedModelData[] {
  const results = [...models].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    if (aValue != null && bValue != null) {
      if (aValue < bValue) return ascending ? -1 : 1;
      if (aValue > bValue) return ascending ? 1 : -1;
    }
    return 0;
  });

  console.log("sortedModels: ", results);
  return results;
}

// Filters an array of ProcessedModelData based on specified filters
export function filterModels(
  models: ProcessedModelData[],
  filters: Partial<ProcessedModelData>,
): ProcessedModelData[] {
  const results = models.filter((model) => {
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

  console.log("filterModels ", results);
  return results;
}
