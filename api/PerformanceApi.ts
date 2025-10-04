import http from './http';
import { safeArray } from "@/utils/safeArray";
import { Performance, PerformanceListResponse, PerformanceDetailResponse } from '@/types/performance';

/** 공연 목록 조회 */
const SORT_MAP: Record<string, string> = {
  "최근등록순": "created_at",
  "공연임박순": "date",   
  "인기많은순": "likes", 
};

export const fetchPerformances = async (
  region?: string[],
  sort?: string,
  page: number = 1,
  size: number = 20
): Promise<PerformanceListResponse> => {
  try {
    const params: Record<string, any> = { page, size };

    // region 처리
    if (region && region.length > 0 && !region.includes("전체")) {
      params.region = region;
    }

    // sort 매핑 처리
    if (sort) {
      params.sort = SORT_MAP[sort] || "date"; // 매핑 실패 시 기본값
    }

    const { data } = await http.get("/performance", {
      params,
      paramsSerializer: (params) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          const value = params[key];
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, v));
          } else {
            searchParams.append(key, value);
          }
        });
        return searchParams.toString();
      },
    });

    return {
      ...data,
      performances: safeArray(data.performances),
    };
  } catch (err) {
    console.error("공연 목록 조회 실패:", err);
    throw err;
  }
};


/** 공연 상세 정보 조회 */
export const fetchPerformanceDetail = async (id: string | number) => {
  try {
    const { data } = await http.get<PerformanceDetailResponse>(`/performance/${id}`);
    return data;
  } catch (err) {
    console.error("공연 상세 조회 실패:", err);
    throw err;
  }
};

/** 1. 오늘 예정된 공연 */
export const fetchTodayPerformances = async (): Promise<Performance[]> => {
  try {
    const res = await http.get('/performance/home/today');
    return safeArray<Performance>(res.data, "performances");
  } catch (error: any) {
    console.error('오늘 공연 조회 실패:', error.message || error);
    return [];
  }
};

/** 2. 인기 많은 공연 */
export const fetchPopularPerformances = async (limit = 6): Promise<Performance[]> => {
  try {
    // 리스트 페이지와 동일 규약: sort=likes, page=1, size=limit
    const res = await http.get('/performance', {
      params: { sort: 'likes', page: 1, size: limit },
    });
    return safeArray<Performance>(res.data, "performances");
  } catch (error: any) {
    console.error('인기 많은 공연 조회 실패:', error.message || error);
    return [];
  }
};

/** 3. NEW 업로드 공연 */
export const fetchRecentPerformances = async (limit = 6): Promise<Performance[]> => {
  try {
    const res = await http.get('/performance/home/recent', { params: { limit } });
    return safeArray<Performance>(res.data, "performances");
  } catch (error: any) {
    console.error('NEW 업로드 공연 조회 실패:', error);
    return [];
  }
};

/** 4. 티켓 오픈 예정 공연 */
export const fetchTicketOpeningPerformances = async (
  startDate: string,
  endDate: string
): Promise<Performance[]> => {
  try {
    const res = await http.get('/performance/home/ticket-opening', {
      params: { startDate, endDate },
    });
    return safeArray<Performance>(res.data, "performances");
  } catch (error) {
    console.error('티켓 오픈 예정 공연 조회 실패:', error);
    throw error;
  }
};

/** 6. 무드별 공연 */
export const fetchMoodPerformances = async (
  mood: string,
  limit = 6
): Promise<Performance[]> => {
  try {
    const res = await http.get('/performance/home/mood', { params: { mood, limit } });
    return safeArray<Performance>(res.data, "performances");
  } catch (error) {
    console.error('무드별 공연 조회 실패:', error);
    throw error;
  }
};