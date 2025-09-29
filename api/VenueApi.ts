import http from "./http";
import { VenueListResponse, VenueDetailResponse, ReviewListResponse } from "@/types/venue";

// 공연장 목록 조회
export async function fetchVenues(page: number, size: number, regions?: string[]): Promise<VenueListResponse> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });

  if (regions && regions.length > 0) {
    regions.forEach(r => params.append("region", r)); 
  }

  const res = await http.get<VenueListResponse>(`/venue?${params.toString()}`);
  return res.data;
}

// 공연장 상세 조회
export async function fetchVenueDetail(id: string | number): Promise<VenueDetailResponse> {
  const res = await http.get<VenueDetailResponse>(`/venue/${id}`);
  return res.data;
}

// 공연장 리뷰 조회
// export const fetchVenueReviews = async (venueId: number, page: number = 1, size: number = 10): Promise<ReviewListResponse> => {
//   const { data } = await http.get(`/venue/${venueId}/review`, { params: { page, size } });
//   return data;
// };
