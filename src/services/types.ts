import { AIModel } from "@/types";

export interface APIResponse {
  data: AIModel[];
}

export interface AppMetaInfo {
  apiCallCount: number;
}

export interface UserModelData {
  id: string;
  [key: string]: any;
}
