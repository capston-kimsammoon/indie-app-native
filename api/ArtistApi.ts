// /api/ArtistApi.ts
import http from "./http";
import { ArtistListResponse, ArtistDetailResponse } from "@/types/artist";

// 아티스트 리스트 조회 (무한 스크롤)
export const fetchArtistList = async (page: number = 1, size: number = 20): Promise<ArtistListResponse> => {
  try {
    const res = await http.get<ArtistListResponse>("/artist", {
      params: { page, size },
    });
    return res.data;
  } catch (err) {
    console.error("fetchArtistList error:", err);
    throw err;
  }
};

// 아티스트 상세 조회
export const fetchArtistDetail = async (id: string | number): Promise<ArtistDetailResponse> => {
  try {
    const res = await http.get<ArtistDetailResponse>(`/artist/${id}`);
    return res.data;
  } catch (err) {
    console.error("fetchArtistDetail error:", err);
    throw err;
  }
};
