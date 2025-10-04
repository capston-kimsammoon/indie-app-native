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

export type NearbyVenue = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address?: string | null;
  image_url?: string | null;
  distance_km?: number;
  upcoming_performances?: number;
};

export type FetchVenueListFlexParams = {
  page: number;
  size: number;
  region?: string | string[];
};

export type NormalizedVenueList<TVenue = unknown> = {
  venues: TVenue[];
  page: number;
  totalPages?: number;
  total?: number;
  raw: unknown;
};

export type UpcomingPerformance = {
  id: number;
  title?: string | null;
  date?: string | null;   // 'YYYY-MM-DD' or ISO
  time?: string | null;   // 'HH:mm' or similar
  image_url?: string | null;
  address?: string | null;
};