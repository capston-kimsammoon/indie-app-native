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