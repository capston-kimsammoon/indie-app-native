// 공연/공연장
export interface PerformanceSearchItem {
  id: number;
  title: string;
  venue: string;
  date: string; // ISO string
  image_url?: string | null;
}

export interface PerformanceSearchResponse {
  page: number;
  totalPages: number;
  performance: PerformanceSearchItem[];
}

export interface VenueSearchItem {
  id: number;
  name: string;
  address: string;
  image_url?: string | null;
}

export interface VenueSearchResponse {
  page: number;
  totalPages: number;
  venues: VenueSearchItem[];
}

// 아티스트
export interface ArtistSearchItem {
  id: number;
  name: string;
  profile_url?: string | null;
  isLiked: boolean;
  isAlarmEnabled: boolean;
}

export interface ArtistSearchResponse {
  page: number;
  totalPages: number;
  artists: ArtistSearchItem[];
}
