import http from "./http";
import { PerformanceSearchResponse, ArtistSearchResponse, VenueSearchResponse } from "@/types/search";
import { useAuthStore } from "@/src/state/authStore"; 

const BASE_URL = "/search";

const fetchSearchResults = {
  performance: async (keyword: string, page = 1, size = 10): Promise<PerformanceSearchResponse> => {
    const response = await http.get<PerformanceSearchResponse>(`${BASE_URL}/performance`, {
      params: { keyword, page, size },
    });
    return response.data;
  },

  venue: async (keyword: string, page = 1, size = 10): Promise<VenueSearchResponse> => {
    // 동일 API 호출, venue 배열만 사용
    const response = await http.get<VenueSearchResponse>(`${BASE_URL}/venue`, {
      params: { keyword, page, size },
    });
    return response.data;
  },

  artist: async (keyword: string, page = 1, size = 10): Promise<ArtistSearchResponse> => {
    const { user } = useAuthStore.getState();
    const headers: Record<string, string> = {};
    if (user?.token) headers.Authorization = `Bearer ${user.token}`;
    
    const response = await http.get<ArtistSearchResponse>(`${BASE_URL}/artist`, {
      params: { keyword, page, size },
      headers,
    });
    return response.data;
  },
};


export default fetchSearchResults;
