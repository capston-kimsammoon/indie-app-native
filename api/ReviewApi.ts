import http from './http';
import config from './config';
import { ReviewItem, normalizeReviewDetail } from '@/types/review';
import { getUserIdFromToken } from "@/utils/auth";
import { TEST_TOKEN } from "@env";

interface FetchParams {
  page?: number;
  size?: number;
}

// 모든 공연장의 리뷰 목록 조회
export const fetchAllReviews = async (
  { page = 1, size = 20 }: FetchParams,
  accessToken?: string
): Promise<{ total: number; items: ReviewItem[] }> => {
  const headers: any = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await http.get(`/venue/all-reviews`, {
    params: { page, size },
    headers,
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = res.data ?? {};

  const items: ReviewItem[] = Array.isArray(data.items)
    ? data.items.map((r: any) => ({
        id: r.id,
        author: r.user?.nickname ?? '익명',
        content: r.content,
        profile_url: r.user?.profile_url ?? '',
        created_at: r.created_at ?? '',
        like_count: r.like_count ?? 0,
        is_liked: r.liked_by_me ?? false,
        images: r.images?.map((im: any) => im.image_url) ?? [],
        is_mine: r.is_mine ?? false,
        venue: r.venue ? { id: r.venue.id, name: r.venue.name } : null,
      }))
    : [];

  return { total: data.total ?? items.length, items };
};


// 공연장 리뷰 전체 조회
export const fetchVenueReviewList = async (
  venueId: number,
  { page = 1, size = 10 }: FetchParams
) => {
  const headers: any = {};
  if (TEST_TOKEN) headers.Authorization = `Bearer ${TEST_TOKEN}`;

  const res = await http.get(`/venue/${venueId}/review`, {
    params: { page, size },
    headers,
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = res.data ?? {};

  // 내 user_id 추출
  const myUserId = TEST_TOKEN ? getUserIdFromToken(TEST_TOKEN) : null;

  // items가 배열인지 확인 후 normalize
  const items: ReviewItem[] = Array.isArray(data.items)
    ? data.items.map((r: any) => ({
        ...r,
        user: r.user ?? { nickname: "익명", profile_url: "", id: null },
        images: r.images ?? [],
        is_liked: r.liked_by_me ?? false,
        like_count: r.like_count ?? 0,
        created_at: r.created_at ?? "",
        isMine: myUserId ? r.user?.id === myUserId : false, // 여기서 판단
      }))
    : [];

  return { total: data.total ?? items.length, items };
};

// // 공연장 리뷰 미리보기 (상세페이지용)
// export const fetchVenueReviewPreview = async (venueId: number, limit = 3) => {
//   const { items } = await fetchVenueReviewList(venueId, 1, limit);
//   return items;
// };

// 리뷰 작성 (이미지 포함, 로그인 필요)
export const createVenueReview = async (
  venueId: number,
  content: string,
  images: (string | { uri: string; type?: string; name?: string })[] = [],
  accessToken?: string
) => {
  const formData = new FormData();
  formData.append("content", content);

  // 이미지 최대 6개
  images.slice(0, 6).forEach((img, idx) => {
    if (!img) return;

    let file: any;
    if (typeof img === "string") {
      const name = img.split("/").pop() ?? `image${idx}.jpg`;
      file = { uri: img, type: "image/jpeg", name };
    } else {
      file = {
        uri: img.uri,
        type: img.type ?? "image/jpeg",
        name: img.name ?? `image${idx}.jpg`,
      };
    }
    formData.append("images", file);
  });

  const headers: any = { "Content-Type": "multipart/form-data" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await http.post(`/venue/${venueId}/review/write`, formData, { headers });

  if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status}`);

  // 서버에서 리턴한 형태를 normalize
  const raw = res.data;
  return normalizeReviewDetail({
    id: raw.id,
    author: raw.user?.nickname || "익명",
    profile_url: raw.user?.profile_url || "",
    content: raw.content,
    created_at: raw.created_at,
    like_count: raw.like_count ?? 0,
    is_liked: raw.liked_by_me ?? false,
    images: raw.images?.map((im: any) => im.image_url) ?? [],
  });
};

// 리뷰 삭제
export const deleteVenueReview = async (reviewId: number, accessToken?: string) => {
  const headers: any = { "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await http.delete(`/venue/review/${reviewId}`, { headers });

  if (res.status < 200 || res.status >= 300) {
    throw new Error("리뷰 삭제 실패");
  }

  return true;
};


// 리뷰 좋아요
export const likeReview = async (reviewId: number, accessToken?: string) => {
  const headers: any = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await http.post(`/review/${reviewId}/like`, {}, { headers });
  if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status}`);
  return res.data;
};

// 리뷰 좋아요 취소
export const unlikeReview = async (reviewId: number, accessToken?: string) => {
  const headers: any = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await http.delete(`/review/${reviewId}/like`, { headers });
  if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status}`);
  return res.data;
};
