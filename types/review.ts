// review.ts
export type ReviewImageWire = { image_url?: string | null } | string;

export type ReviewUserWire = {
  id?: number | null;
  nickname?: string | null;
  profile_url?: string | null;
};

export type ReviewCreateWire = {
  content: string;
  images?: string[];
};

export type ReviewItemWire = {
  id: number;
  content?: string | null;
  created_at?: string | number | Date | null;
  user?: ReviewUserWire | null;
  images?: ReviewImageWire[] | null;
  like_count?: number | null;
  liked_by_me?: boolean | null;

  venue?: { id?: number | null; name?: string | null; logo_url?: string | null } | null;
  venue_id?: number | null;
  venue_name?: string | null;
  venue_logo_url?: string | null;
};

export type NormalizedReview = {
  id: number;
  text: string;
  created_at: string;
  author: string;
  profile_url?: string;
  images: string[];
  like_count: number;
  is_liked: boolean;
  user_id?: number | null;
  venue?: {
    id?: number | null;
    name?: string | null;
    logo_url?: string | null;
  } | null;
  raw?: any;
};

// UI용 타입 (리뷰 페이지에서 바로 사용)
export interface ReviewItem {
  id: number;
  author: string;
  content: string;
  profile_url: string;
  created_at?: string;
  like_count?: number;
  is_liked?: boolean;
  images?: string[];
  isMine?: boolean;
  venue?: {
    id: number;
    name: string;
    logo_url?: string;
  } | null;
}

export type ReviewListResponse = {
  page?: number;
  size?: number;
  totalPages?: number;
  total?: number;
  reviews: ReviewItemWire[];
};
