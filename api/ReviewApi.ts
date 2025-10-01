// src/api/ReviewApi.ts
// -----------------------------------------------------------
// 백엔드 스펙(2025-10-01) 기준
// - 내 리뷰:    GET    /venue/my/review   (page, size<=100, order)
// - 작성:       POST   /venue/{id}/review/write (multipart)
// - 삭제:       DELETE /venue/review/{review_id}
// - 좋아요:     POST   /venue/review/{review_id}/like
//               DELETE /venue/review/{review_id}/like
// - (옵션) 공연장 리뷰: GET /venue/{id}/review
// - (옵션) 전체 리뷰:   GET /venue/reviews
// -----------------------------------------------------------

import http from "./http";

// ===== 타입(백 스키마에 맞춤) =====
export type ReviewImageWire = { image_url?: string | null } | string;
export type ReviewUserWire = {
  id?: number | null;
  nickname?: string | null;
  profile_url?: string | null;
};

export type ReviewItemWire = {
  id: number;
  content?: string | null;
  created_at?: string | number | Date | null;
  user?: ReviewUserWire | null;
  images?: ReviewImageWire[] | null;
  like_count?: number | null;
  liked_by_me?: boolean | null;

  // (옵션) 일부 엔드포인트에서만
  venue?: { id?: number | null; name?: string | null; logo_url?: string | null } | null;
  venue_id?: number | null;
  venue_name?: string | null;
};

export type NormalizedReview = {
  id: number;
  text: string;
  created_at: string;     // ISO
  author: string;
  profile_url?: string;
  images: string[];
  like_count: number;
  is_liked: boolean;
  user_id?: number | null;
  venue_id?: number | null;
  venue_name?: string;
  raw?: any;
};

// ===== 유틸 =====
function toIsoStringSafe(v: any): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "number") return new Date(v).toISOString();
  return String(v);
}

function toImages(arr: ReviewImageWire[] | null | undefined): string[] {
  if (!arr) return [];
  return arr
    .map((x) => (typeof x === "string" ? x : x?.image_url || ""))
    .filter(Boolean);
}

function normalizeReview(r: ReviewItemWire): NormalizedReview {
  const u = r?.user ?? {};
  const v = r?.venue ?? {};
  return {
    id: Number(r.id),
    text: r?.content ?? "",
    created_at: toIsoStringSafe(r?.created_at),
    author: u?.nickname || "익명",
    profile_url: (u?.profile_url ?? "") || undefined,
    images: toImages(r?.images),
    like_count: Number(r?.like_count ?? 0),
    is_liked: Boolean(r?.liked_by_me ?? false),
    user_id: u?.id ?? null,
    venue_id: (r?.venue_id ?? v?.id) ?? null,
    venue_name: (r?.venue_name ?? (v as any)?.name) || "",
    raw: r,
  };
}

// ===== API =====

// 내가 쓴 리뷰
export async function fetchMyReviews({
  page = 1,
  size = 20,                 // 서버 최대 100
  order = "desc",
}: {
  page?: number;
  size?: number;
  order?: "asc" | "desc";
} = {}): Promise<{ total: number; page: number; size: number; items: NormalizedReview[] }> {
  const s = Math.min(100, Math.max(1, size));
  const res = await http.get("/venue/my/review", { params: { page, size: s, order } });
  if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status}`);

  const list: ReviewItemWire[] = Array.isArray(res.data?.items) ? res.data.items : [];
  const items = list.map(normalizeReview);
  const total = Number(res.data?.total ?? items.length);
  return { total, page: Number(res.data?.page ?? page), size: Number(res.data?.size ?? s), items };
}

// (옵션) 공연장 리뷰
export async function fetchVenueReviewList(
  venueId: number,
  { page = 1, size = 10 }: { page?: number; size?: number } = {}
) {
  const s = Math.min(100, Math.max(1, size));
  const res = await http.get(`/venue/${venueId}/review`, { params: { page, size: s } });
  if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status}`);
  const list: ReviewItemWire[] = Array.isArray(res.data?.items) ? res.data.items : [];
  return {
    total: Number(res.data?.total ?? list.length),
    page: Number(res.data?.page ?? page),
    size: Number(res.data?.size ?? s),
    items: list.map(normalizeReview),
  };
}

// (옵션) 전체 리뷰
export async function fetchAllReviews({
  page = 1,
  size = 20,
  order = "desc",
}: {
  page?: number;
  size?: number;
  order?: "asc" | "desc";
} = {}) {
  const res = await http.get("/venue/reviews", { params: { page, size, order } });
  if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status}`);
  const list: ReviewItemWire[] = Array.isArray(res.data?.items) ? res.data.items : [];
  return {
    total: Number(res.data?.total ?? list.length),
    page: Number(res.data?.page ?? page),
    size: Number(res.data?.size ?? size),
    items: list.map(normalizeReview),
  };
}

// 작성 (multipart)
export async function createVenueReview(
  venueId: number,
  content: string,
  images: (string | { uri: string; type?: string; name?: string })[] = []
): Promise<NormalizedReview> {
  const form = new FormData();
  form.append("content", content);
  images.slice(0, 6).forEach((img, idx) => {
    const file =
      typeof img === "string"
        ? { uri: img, type: "image/jpeg", name: img.split("/").pop() ?? `image${idx}.jpg` }
        : { uri: img.uri, type: img.type ?? "image/jpeg", name: img.name ?? `image${idx}.jpg` };
    form.append("images", file as any);
  });

  const res = await http.post(`/venue/${venueId}/review/write`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status}`);
  return normalizeReview(res.data as ReviewItemWire);
}

// 삭제
export async function deleteReview(reviewId: number): Promise<boolean> {
  const res = await http.delete(`/venue/review/${reviewId}`);
  if (res.status < 200 || res.status >= 300) throw new Error("리뷰 삭제 실패");
  return true;
}

// 좋아요
export async function likeReview(reviewId: number) {
  const res = await http.post(`/venue/review/${reviewId}/like`, {});
  if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status}`);
  return res.data; // { like_count, liked_by_me: true }
}

// 좋아요 취소
export async function unlikeReview(reviewId: number) {
  const res = await http.delete(`/venue/review/${reviewId}/like`);
  if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status}`);
  return res.data; // { like_count, liked_by_me: false }
}
