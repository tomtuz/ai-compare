import axios from "axios";
import { useQuery, useQueryClient } from "react-query";
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

import { useAppContext } from "@/context/AppContext";

const API_URL = "https://openrouter.ai/api/v1/models";

// API fetched (external) and User added (local) data
const EXTERNAL_MODELS_KEY = "ai_cmp_ExternalModelData"; // avoid changing this data
const LOCAL_MODELS_KEY = "ai_cmp_ExternalModelData";
// const FAVORITE_MODELS_KEY = "ai_cmp_FavoriteModels";

// App meta information, i.e. api call count
// const APP_META_KEY = "ai_cmp_MetaInfo";

export function useAPIService() {
  const queryClient = useQueryClient();
  const { incrementApiCallCount } = useAppContext();

  // Fetch models from API or local storage
  const fetchModels = async (): Promise<ProcessedModelData[]> => {
    try {
      const cachedData = localStorage.getItem(EXTERNAL_MODELS_KEY);
      let processedData: ProcessedModelData[] = [];

      if (cachedData) {
        processedData = JSON.parse(cachedData) as ProcessedModelData[];
      } else {
        const response = await axios.get<APIResponse>(API_URL);
        const modelData: AIModel[] = response.data.data;
        processedData = modelData.map(processModelData);
        processedData = normalizeEfficiencyScores(processedData);

        if (incrementApiCallCount) {
          incrementApiCallCount();
        } else {
          console.log("API call not updated!");
        }

        localStorage.setItem(
          EXTERNAL_MODELS_KEY,
          JSON.stringify(processedData),
        );
      }

      return mergeWithUserData(processedData);
    } catch (error) {
      console.error("Error fetching AI models:", error);
      throw error;
    }
  };

  // Merge API data with user data
  const mergeWithUserData = (
    openRouterData: ProcessedModelData[],
  ): ProcessedModelData[] => {
    const userData = getUserData();
    return mergeDataSources(openRouterData, userData);
  };

  // React Query hook for fetching models
  const useModels = () => {
    return useQuery<ProcessedModelData[], Error>("aiModels", fetchModels, {
      staleTime: 5 * 60 * 1000,
      cacheTime: 60 * 60 * 1000,
    });
  };

  // Refresh models by clearing cache and refetching
  const refreshModels = async () => {
    localStorage.removeItem(EXTERNAL_MODELS_KEY);
    await queryClient.invalidateQueries("aiModels");
  };

  // Get user data from local storage
  const getUserData = (): UserModelData[] => {
    const userData = localStorage.getItem(LOCAL_MODELS_KEY);
    return userData ? JSON.parse(userData) : [];
  };

  // Save user data to local storage
  const saveUserData = (data: UserModelData[]) => {
    localStorage.setItem(LOCAL_MODELS_KEY, JSON.stringify(data));
    queryClient.invalidateQueries("aiModels");
  };

  // Update a single user model
  const updateUserModel = (model: UserModelData) => {
    const userData = getUserData();
    const index = userData.findIndex((m) => m.id === model.id);
    if (index !== -1) {
      userData[index] = { ...userData[index], ...model };
    } else {
      userData.push(model);
    }
    saveUserData(userData);
  };

  // Delete a user model
  const deleteUserModel = (id: string) => {
    const userData = getUserData();
    const updatedUserData = userData.filter((m) => m.id !== id);
    saveUserData(updatedUserData);
  };

  return {
    useModels,
    refreshModels,
    getUserData,
    updateUserModel,
    deleteUserModel,
  };
}
