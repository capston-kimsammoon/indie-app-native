export type Venue = {
  id: number;
  name: string;
  region: string;
  image_url: string;
  review_count: number;
};

export type VenueListResponse = {
  page: number;
  totalPages: number;
  venue: Venue[];
};

export interface VenueReviewItem {
  id: number | string;
  content: string;
  userName: string;
  userProfile?: string; // optional
}

export interface ReviewListResponse {
  total: number;
  items: VenueReviewItem[];
}

export interface VenueDetailResponse {
  id: number | string;
  name: string;
  image_url: string;
  instagram_account?: string;
  address: string;
  latitude: number;
  longitude: number;

  upcomingPerformances: Venue[];  // 배열로
  pastPerformances: Venue[];  // 배열로
}
