import http from "./http";
import {
  PerformanceSearchResponse,
  ArtistSearchResponse,
} from "@/types/search";
import { TEST_TOKEN } from "@env";

const BASE_URL = "/search";

const fetchSearchResults = {
  performance: async (keyword: string, page = 1, size = 10): Promise<PerformanceSearchResponse> => {
    const response = await http.get<PerformanceSearchResponse>(`${BASE_URL}/performance`, {
      params: { keyword, page, size },
    });
    return response.data;
  },

  artist: async (keyword: string, page = 1, size = 10): Promise<ArtistSearchResponse> => {
    // 항상 Authorization 헤더 포함
    const response = await http.get<ArtistSearchResponse>(`${BASE_URL}/artist`, {
      params: { keyword, page, size },
      headers: {
        Authorization: `Bearer ${TEST_TOKEN}`,
      },
    });
    return response.data;
  },
};

export default fetchSearchResults;