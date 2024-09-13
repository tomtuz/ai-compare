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

export interface APIResponse {
  data: AIModel[];
}

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
