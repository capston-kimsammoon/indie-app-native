export interface ReviewItem {
  id: number;
  author: string;
  content: string;
  profile_url: string;
  created_at?: string;
  like_count?: number;
  is_liked?: boolean;
  images?: string[];
  is_mine?: boolean;
  venue?: { 
    id: number;
    name: string;
  } | null;
}

export interface ReviewListResponse {
  total: number;
  items: ReviewItem[];
}

// 리뷰 상세용 정규화 함수
export const normalizeReviewDetail = (raw: any): ReviewItem => ({
  id: raw.id,
  author: raw.author || '익명',
  content: raw.content || '',
  created_at: raw.created_at || '',
  profile_url: raw.profile_url ? raw.profile_url.trim().replace(/"/g, '') : '',
  like_count: typeof raw.like_count === 'number' ? raw.like_count : 0,
  is_liked: raw.is_liked ?? false,
  images: raw.images ?? [],
});
