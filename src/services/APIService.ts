import axios from "axios";
import { useQuery, QueryClient } from "react-query";
import {
  processModelData,
  mergeDataSources,
  normalizeEfficiencyScores,
} from "@/utils/dataProcessing";
import type {
  AIModel,
  APIResponse,
  ProcessedModelData,
  UserModelData,
} from "@/types";

const API_URL = "https://openrouter.ai/api/v1/models";
const LOCAL_STORAGE_KEY = "aiModelsData";
const USER_DATA_KEY = "userModelData";

export class APIService {
  private static instance: APIService;
  private queryClient: QueryClient;

  private constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  // Singleton instance getter
  public static getInstance(queryClient: QueryClient): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService(queryClient);
    }
    return APIService.instance;
  }

  // Fetch models from API or local storage
  private async fetchModels(): Promise<ProcessedModelData[]> {
    try {
      const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      let processedData: ProcessedModelData[] = [];

      if (cachedData) {
        processedData = JSON.parse(cachedData) as ProcessedModelData[];
      } else {
        const response = await axios.get<APIResponse>(API_URL);
        const modelData: AIModel[] = response.data.data;
        processedData = modelData.map(processModelData);
        processedData = normalizeEfficiencyScores(processedData);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(processedData));
      }

      return this.mergeWithUserData(processedData);
    } catch (error) {
      console.error("Error fetching AI models:", error);
      throw error;
    }
  }

  // Merge API data with user data
  private mergeWithUserData(
    openRouterData: ProcessedModelData[],
  ): ProcessedModelData[] {
    const userData = this.getUserData();
    return mergeDataSources(openRouterData, userData);
  }

  // React Query hook for fetching models
  public useModels() {
    return useQuery<ProcessedModelData[], Error>(
      "aiModels",
      () => this.fetchModels(),
      {
        staleTime: 5 * 60 * 1000,
        cacheTime: 60 * 60 * 1000,
      },
    );
  }

  // Refresh models by clearing cache and refetching
  public async refreshModels() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    await this.queryClient.invalidateQueries("aiModels");
  }

  // Get user data from local storage
  public getUserData(): UserModelData[] {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : [];
  }

  // Save user data to local storage
  public saveUserData(data: UserModelData[]) {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
    this.queryClient.invalidateQueries("aiModels");
  }

  // Update a single user model
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

  // Delete a user model
  public deleteUserModel(id: string) {
    const userData = this.getUserData();
    const updatedUserData = userData.filter((m) => m.id !== id);
    this.saveUserData(updatedUserData);
  }
}

// Exported hooks for use in components
export const useModels = (queryClient: QueryClient) =>
  APIService.getInstance(queryClient).useModels();
export const useRefreshModels = (queryClient: QueryClient) => () =>
  APIService.getInstance(queryClient).refreshModels();
export const useUpdateUserModel =
  (queryClient: QueryClient) => (model: UserModelData) =>
    APIService.getInstance(queryClient).updateUserModel(model);
export const useDeleteUserModel = (queryClient: QueryClient) => (id: string) =>
  APIService.getInstance(queryClient).deleteUserModel(id);
