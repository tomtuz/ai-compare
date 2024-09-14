// global type
export interface AIModel {
  id: string;
  name: string;
  created: number;
  description: string;
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type: string | null;
  };
  pricing: {
    prompt: string;
    completion: string;
    image: string;
    request: string;
  };
  top_provider: {
    context_length: number | null;
    max_completion_tokens: number | null;
    is_moderated: boolean;
  };
  per_request_limits: null | any;
}

// API Service related
export interface APIResponse {
  data: AIModel[];
}

// Application Data related
export interface AppMetaInfo {
  apiCallCount: number;
}

// Table related
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

export interface ChartData {
  name: string;
  cost: number;
  efficiency: number;
  isFavorite: boolean;
  isModified: boolean;
  inputCost: number;
  outputCost: number;
  source: string;
}

// Define interfaces for configuration objects
export interface SortConfig {
  key: keyof ProcessedModelData;
  direction: "asc" | "desc";
}

export interface FilterConfig {
  searchTerm: string;
  showOnlyFavorites: boolean;
  favorites: string[];
}

export interface PaginationConfig {
  currentPage: number;
  rowsPerPage: number;
}
