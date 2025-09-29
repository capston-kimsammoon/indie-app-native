export interface Performance {
  id: string;
  title: string;
  venue?: string;
  date?: string; // ISO string
  posterUrl?: string;
  content?: string;
  ticketOpenDate?: string;
  ticketOpenTime?: string;
  // 필요에 따라 추가
}

export type PerformanceListResponse = {
  page: number;
  totalPages: number;
  performances: {
    id: number;
    title: string;
    venue: string;
    date: string;
    region?: string;
    thumbnail: string;
  }[];
};

export type PerformanceDetailResponse = {
  id: number;
  title: string;
  date: string; // ISO
  venueId: number;
  venue: string;
  posterUrl: string; // 
  artists: { id: number; name: string; image_url?: string }[];
  price: string | null;
  ticket_open_date?: string | null;
  ticket_open_time?: string | null;
  shortcode?: string,
  detailLink?: string;
  likeCount: number;   
  isLiked: boolean;
  isAlarmed: boolean;
};
