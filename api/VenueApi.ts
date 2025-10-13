import http from "./http";
import { VenueListResponse, VenueDetailResponse, } from "@/types/venue";


/* ============== 고정 스키마 API ============== */

// 공연장 목록 조회 (고정형)
export async function fetchVenues(
  page: number,
  size: number,
  regions?: string[]
): Promise<VenueListResponse> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (regions?.length) regions.forEach((r) => params.append("region", r));
  const res = await http.get<VenueListResponse>(`/venue?${params.toString()}`);
  return res.data;
}

// 공연장 상세 조회 (고정형)
export async function fetchVenueDetail(
  id: string | number
): Promise<VenueDetailResponse> {
  const res = await http.get<VenueDetailResponse>(`/venue/${id}`);
  return res.data;
}

