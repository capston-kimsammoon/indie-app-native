// 공연/공연장
export interface PerformanceSearchItem {
  id: number;
  title: string;
  venue: string;
  date: string; // ISO string
  image_url: string;
}

export interface VenueSearchItem {
  id: number;
  name: string;
  address: string;
  image_url: string;
}

export interface PerformanceSearchResponse {
  page: number;
  totalPages: number;
  performance: PerformanceSearchItem[];
  venue: VenueSearchItem[];
}

// 아티스트
export interface ArtistSearchItem {
  id: number;
  name: string;
  profile_url: string;
  isLiked: boolean;
  isAlarmEnabled: boolean;
}

export interface ArtistSearchResponse {
  page: number;
  totalPages: number;
  artists: ArtistSearchItem[];
}
