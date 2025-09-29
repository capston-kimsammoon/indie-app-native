export interface Artist {
  id: string;
  name: string;
  profileUrl: string;
}

// Performance 관련 타입
export interface Performance {
  id: number;
  title: string;
  date: string;       // ISO 문자열 또는 "YYYY.MM.DD"
  image_url: string;
}

export interface ArtistItem {
  id: number;
  name: string;
  image_url: string;
  isLiked: boolean;
}

export interface ArtistListResponse {
  page: number;
  totalPages: number;
  artists: ArtistItem[];
}

// 아티스트 상세 정보
export interface ArtistDetailResponse {
  id: number;
  name: string;
  image_url: string;
  spotify_url: string;
  instagram_account: string;
  isLiked: boolean;
  isNotified: boolean;
  upcomingPerformances: Performance[];
  pastPerformances: Performance[];
}