// api/NearbyApi.ts
import http from "./http";
import {
  NearbyVenueResponse,
  PerformanceBoundsRequest,
  NearbyPerformanceResponse,
  VenuePerformanceItem,
  RecenterRequest,
} from "@/types/nearby";

const NearbyApi = {
  // 1. 반경 내 공연장 조회
  getNearbyVenues: async (lat: number, lng: number, radius: number = 3): Promise<NearbyVenueResponse[]> => {
    const res = await http.get("/nearby/venue", { params: { lat, lng, radius } });
    return res.data;
  },

  // 2. 지도 영역 내 공연 조회
  getPerformancesInBounds: async (bounds: PerformanceBoundsRequest): Promise<NearbyPerformanceResponse[]> => {
    const res = await http.post("/nearby/performance", bounds);
    return res.data;
  },

  // 3. 특정 공연장 현재 시각 이후 예정 공연 조회
  getVenuePerformances: async (venue_id: number, after?: string): Promise<VenuePerformanceItem[]> => {
    const res = await http.get(`/nearby/venue/${venue_id}/performance`, { params: { after } });
    return res.data;
  },

  // 4. 지도 리센터 (프론트 전용)
  recenterMap: async (data: RecenterRequest): Promise<{ message: string }> => {
    const res = await http.post("/nearby/recenter", data);
    return res.data;
  },
};

export default NearbyApi;



// import http from "./http";
// import { NearbyVenue, FetchVenueListFlexParams, NormalizedVenueList, UpcomingPerformance, } from "@/types/nearby";


// /* ============== 공용 유틸 ============== */
// const pickArray = (x: any) =>
//   Array.isArray(x) ? x
//   : Array.isArray(x?.venues) ? x.venues
//   : Array.isArray(x?.items)  ? x.items
//   : Array.isArray(x?.data)   ? x.data
//   : Array.isArray(x?.results)? x.results
//   : [];

// const pickPerfArray = pickArray;

// const normalizePerf = (p: any): UpcomingPerformance => ({
//   id: p?.id ?? p?.performance_id ?? 0,
//   title: p?.title ?? p?.name ?? null,
//   date: p?.date ?? p?.performance_date ?? p?.start_date ?? null,
//   time: p?.time ?? p?.start_time ?? null,
//   image_url: p?.image_url ?? p?.poster ?? p?.thumbnail ?? null,
//   address: p?.address ?? p?.venue_address ?? p?.location?.address ?? null,
// });

// /**
//  * 가까운 공연장 조회 (반경 km, 기본 3km)
//  * 서버가 lng 대신 lon, 반경을 미터로 받을 가능성을 모두 커버
//  */
// export async function fetchNearbyVenues(
//   lat: number,
//   lng: number,
//   radius: number = 3
// ): Promise<NearbyVenue[]> {
//   const { data } = await http.get<NearbyVenue[]>("/nearby/venue", {
//     params: { lat, lng, radius },
//   });
//   return Array.isArray(data) ? data : [];
// }


// /**
//  * 공연장 목록 조회 (유연/정규화 버전)
//  */
// export async function fetchVenueListFlex<TVenue = unknown>({
//   page,
//   size,
//   region,
// }: FetchVenueListFlexParams): Promise<NormalizedVenueList<TVenue>> {
//   let regionParam: string | undefined;
//   if (Array.isArray(region)) regionParam = region.length ? region.join(",") : undefined;
//   else if (typeof region === "string" && region.trim() !== "") regionParam = region.trim();

//   const { data } = await http.get<any>("/venue", { params: { page, size, region: regionParam } });

//   const venues: TVenue[] =
//     Array.isArray(data?.venue) ? data.venue
//     : Array.isArray(data?.venues) ? data.venues
//     : Array.isArray(data?.items) ? data.items
//     : Array.isArray(data) ? data
//     : [];

//   return {
//     venues,
//     page: data?.page ?? page ?? 1,
//     totalPages: data?.totalPages ?? data?.pages ?? undefined,
//     total: data?.total ?? undefined,
//     raw: data,
//   };
// }

// /**
//  * 특정 공연장의 예정 공연 조회
//  */
// export async function fetchUpcomingPerformancesByVenue(
//   venueId: number | string,
//   afterTime?: string | Date
// ): Promise<UpcomingPerformance[]> {
//   const after = afterTime instanceof Date ? afterTime.toISOString() : afterTime;

//   try {
//     const { data } = await http.get<any>(`/nearby/venue/${venueId}/performance`, {
//       params: after ? { after } : undefined,
//     });
//     let arr = pickPerfArray(data);

//     if (!arr.length && after) {
//       const { data: d2 } = await http.get<any>(`/nearby/venue/${venueId}/performance`);
//       arr = pickPerfArray(d2);
//     }

//     return arr.map(normalizePerf);
//   } catch (e) {
//     console.error("❌ 예정 공연 조회 실패:", e);
//     return [];
//   }
// }