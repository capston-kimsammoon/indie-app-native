// src/api/stampApi.ts
import http from "./http";

// ===== 백엔드 모델 미러 타입 =====
export type VenueResponse = {
  id: number;
  name: string;
  image_url?: string | null;
};

export type PerformanceResponse = {
  id: number;
  title: string;
  date: string;                // ISO or 'YYYY-MM-DD'
  image_url?: string | null;
  venue?: VenueResponse | null;
};

export type AvailableStampResponse = {
  id: number;
  performance_id: number;
  posterUrl?: string | null;   // 백엔드가 camelCase로 보냄
  venueImageUrl?: string | null;
  venue: string;
  title: string;
  date: string;
  is_collected: boolean;
};

export type StampResponse = {
  id: number;
  user_id: number;
  performance_id: number;
  created_at: string;          // datetime ISO
  performance?: PerformanceResponse | null;
};

export type StampCollectRequest = {
  stampId: number;             // performance_id
};

// ===== API =====

/** 최근 N일(기본 3일) 스탬프 후보 */
export async function fetchAvailableStamps(
  days: number = 3
): Promise<AvailableStampResponse[]> {
  const { data } = await http.get<AvailableStampResponse[]>(
    "/stamps/available",
    { params: { days } }
  );
  return Array.isArray(data) ? data : [];
}

/** 수집한 스탬프 (월/연 필터) */
export type FetchCollectedOpts = {
  startMonth?: number;
  endMonth?: number;
  startYear?: number;
  endYear?: number;
};

export async function fetchCollectedStamps(
  opts: FetchCollectedOpts = {}
): Promise<StampResponse[]> {
  const params: Record<string, number> = {};
  if (opts.startMonth != null) params.startMonth = opts.startMonth;
  if (opts.endMonth != null) params.endMonth = opts.endMonth;
  if (opts.startYear != null) params.startYear = opts.startYear;
  if (opts.endYear != null) params.endYear = opts.endYear;

  const { data } = await http.get<StampResponse[]>("/stamps/collected", {
    params,
  });
  return Array.isArray(data) ? data : [];
}

/** 스탬프 수집 */
export async function collectStamp(
  performanceId: number
): Promise<{ ok?: boolean; message?: string } & Partial<StampResponse>> {
  const body: StampCollectRequest = { stampId: performanceId };
  const { data } = await http.post("/stamps/collect", body);
  return data ?? { ok: false, message: "no response" };
}

// ===== (선택) UI 전용 매퍼 =====
// 컴포넌트에서 쓰기 쉬운 형태로 변환하고 싶으면 이걸 사용하세요.
export type UIStamp = { id: number; image: string; date: string };

export function toUIStampFromCollected(s: StampResponse): UIStamp {
  const img =
    s.performance?.image_url ??
    s.performance?.venue?.image_url ??
    "https://dummyimage.com/100x100/eeeeee/aaaaaa&text=NO+IMG";

  // 'YYYY-MM-DD' or ISO → 'YYYY.MM.DD'
  const dashToDot = (input?: string | null) => {
    const d = input?.split("T")[0];
    return d ? d.replace(/-/g, ".") : "-";
  };

  return {
    id: s.id,
    image: img,
    date: dashToDot(s.performance?.date),
  };
}

export function toUIStampFromAvailable(a: AvailableStampResponse): UIStamp {
  const img =
    a.posterUrl ??
    a.venueImageUrl ??
    "https://dummyimage.com/100x100/eeeeee/aaaaaa&text=NO+IMG";

  const dashToDot = (input?: string | null) => {
    const d = input?.split("T")[0];
    return d ? d.replace(/-/g, ".") : "-";
  };

  return {
    id: a.id,
    image: img,
    date: dashToDot(a.date),
  };
}
