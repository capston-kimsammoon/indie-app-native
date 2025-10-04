import http from "./http";
import { PerformanceSearchResponse, ArtistSearchResponse } from "@/types/search";
import { useAuthStore } from "@/src/state/authStore"; 

const BASE_URL = "/search";

const fetchSearchResults = {
  performance: async (keyword: string, page = 1, size = 10): Promise<PerformanceSearchResponse> => {
    const response = await http.get<PerformanceSearchResponse>(`${BASE_URL}/performance`, {
      params: { keyword, page, size },
    });
    return response.data;
  },

  artist: async (
    keyword: string,
    page = 1,
    size = 10
  ): Promise<ArtistSearchResponse> => {
    const { user } = useAuthStore.getState();
    const headers: Record<string, string> = {};

    if (user?.token) {
      headers.Authorization = `Bearer ${user.token}`;
    }

    const response = await http.get<ArtistSearchResponse>(`${BASE_URL}/artist`, {
      params: { keyword, page, size },
      headers,
    });
    return response.data;
  },
};

export default fetchSearchResults;
