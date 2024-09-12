import axios from "axios";
import { useQuery, QueryClient } from "react-query";
import {
  ProcessedModelData,
  UserModelData,
  processModelData,
  mergeDataSources,
} from "@/utils/dataProcessing";

export interface AIModel {
  id: string;
  name: string;
  created: number;
  description: string;
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type: unknown;
  };
  pricing: {
    prompt: string;
    completion: string;
    image: string;
    request: string;
  };
  top_provider: {
    context_length: number;
    max_completion_tokens: number;
    is_moderated: boolean;
  };
  per_request_limits: unknown;
}

interface APIResponse {
  data: AIModel[];
}

const API_URL = "https://openrouter.ai/api/v1/models";
const LOCAL_STORAGE_KEY = "aiModelsData";
const USER_DATA_KEY = "userModelData";

export class APIService {
  private static instance: APIService;
  private queryClient: QueryClient;

  private constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  public static getInstance(queryClient: QueryClient): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService(queryClient);
    }
    return APIService.instance;
  }

  private async fetchModels(): Promise<ProcessedModelData[]> {
    try {
      const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      let processedData: ProcessedModelData[] = [];

      if (cachedData) {
        processedData = JSON.parse(cachedData) as ProcessedModelData[];
      } else {
        const response = await axios.get<APIResponse>(API_URL);
        processedData = response.data.data.map(processModelData);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(processedData));
      }

      return this.mergeWithUserData(processedData);
    } catch (error) {
      console.error("Error fetching AI models:", error);
      throw error;
    }
  }

  private mergeWithUserData(
    openRouterData: ProcessedModelData[],
  ): ProcessedModelData[] {
    const userData = this.getUserData();
    return mergeDataSources(openRouterData, userData);
  }

  public useModels() {
    return useQuery<ProcessedModelData[], Error>(
      "aiModels",
      () => this.fetchModels(),
      {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 60 * 60 * 1000, // 1 hour
      },
    );
  }

  public async refreshModels() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    await this.queryClient.invalidateQueries("aiModels");
  }

  public getUserData(): UserModelData[] {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : [];
  }

  public saveUserData(data: UserModelData[]) {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
    this.queryClient.invalidateQueries("aiModels");
  }

  public updateUserModel(model: UserModelData) {
    const userData = this.getUserData();
    const index = userData.findIndex((m) => m.id === model.id);
    if (index !== -1) {
      userData[index] = { ...userData[index], ...model };
    } else {
      userData.push(model);
    }
    this.saveUserData(userData);
  }

  public deleteUserModel(id: string) {
    const userData = this.getUserData();
    const updatedUserData = userData.filter((m) => m.id !== id);
    this.saveUserData(updatedUserData);
  }
}

export const useModels = (queryClient: QueryClient) =>
  APIService.getInstance(queryClient).useModels();
export const useRefreshModels = (queryClient: QueryClient) => () =>
  APIService.getInstance(queryClient).refreshModels();
export const useUpdateUserModel =
  (queryClient: QueryClient) => (model: UserModelData) =>
    APIService.getInstance(queryClient).updateUserModel(model);
export const useDeleteUserModel = (queryClient: QueryClient) => (id: string) =>
  APIService.getInstance(queryClient).deleteUserModel(id);
