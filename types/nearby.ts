// types/nearby.ts

export type NearbyVenueResponse = {
  venue_id: number;
  name: string;
  latitude: number;
  longitude: number;
};

export type SelectedNearbyPerformanceItem = {
  venue_id: number;
  name: string;
  title?: string;
  time: string;
  address?: string;
  image_url?: string | null;
}

export type PerformanceBoundsRequest = {
  sw_lat: number;
  sw_lng: number;
  ne_lat: number;
  ne_lng: number;
};

export type PerformanceSummary = {
  id: number;
  title?: string;
  time: string;
  image_url?: string | null;
  address?: string;
};

export type NearbyPerformanceResponse = {
  venue_id: number;
  name: string;
  address?: string;
  image_url?: string | null;
  latitude?: number;
  longitude?: number;
  performance: PerformanceSummary[];
};

export type VenuePerformanceItem = {
  performance_id: number;
  title: string;
  time: string;
  name: string;
  address: string;
  image_url?: string | null;
};

export type RecenterRequest = {
  lat: number;
  lng: number;
};



/*export type NearbyVenue = {
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
*/