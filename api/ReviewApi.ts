// ReviewApi.ts
import http from "./http";
import { ReviewItemWire, NormalizedReview, ReviewCreateWire } from "@/types/review";

// ===== 유틸 =====
function toIsoStringSafe(v: any): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "number") return new Date(v).toISOString();
  return String(v);
}

function toImages(arr: ReviewItemWire["images"]): string[] {
  if (!arr) return [];
  return arr.map((x) => (typeof x === "string" ? x : x?.image_url || "")).filter(Boolean);
}

// ===== normalize =====
export function normalizeReview(r: ReviewItemWire): NormalizedReview {
  const u = r?.user ?? {};
  return {
    id: Number(r.id),
    text: r.content ?? "",
    created_at: toIsoStringSafe(r.created_at),
    author: u.nickname || "익명",
    profile_url: u.profile_url || undefined,
    images: toImages(r.images),
    like_count: Number(r.like_count ?? 0),
    is_liked: Boolean(r.liked_by_me ?? false),
    user_id: u.id ?? null,
    venue: r.venue
      ? {
          id: r.venue.id ?? null,
          name: r.venue.name ?? "",
          logo_url: r.venue.logo_url ?? "",
        }
      : null,
    raw: r,
  };
}

// ===== API 함수 =====

// 1. 전체 리뷰
export async function fetchAllReviews({ page = 1, size = 20, order = "desc" } = {}) {
  const params: Record<string, any> = { page, size, order };
  Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);

  const res = await http.get("/venue/reviews/all", { params });
  if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status}`);

  const list: ReviewItemWire[] = Array.isArray(res.data?.items) ? res.data.items : [];
  return {
    total: Number(res.data?.total ?? list.length),
    page: Number(res.data?.page ?? page),
    size: Number(res.data?.size ?? size),
    items: list.map(normalizeReview),
  };
}

// 2. 내가 쓴 리뷰
export async function fetchMyReviews({ page = 1, size = 20, order = "desc" } = {}) {
  const s = Math.min(100, Math.max(1, size));
  const res = await http.get("/venue/my/review", { params: { page, size: s, order } });
  if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status}`);
  const list: ReviewItemWire[] = Array.isArray(res.data?.items) ? res.data.items : [];
  return {
    total: Number(res.data?.total ?? list.length),
    page: Number(res.data?.page ?? page),
    size: Number(res.data?.size ?? s),
    items: list.map(normalizeReview),
  };
}

// 3. 특정 공연장 리뷰
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

// 4. 리뷰 작성
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


// 5. 리뷰 삭제
export async function deleteReview(reviewId: number) {
  const res = await http.delete(`/venue/review/${reviewId}`);
  if (res.status < 200 || res.status >= 300) throw new Error("리뷰 삭제 실패");
  return true;
}

// 6. 좋아요
export async function likeReview(reviewId: number) {
  const res = await http.post(`/venue/review/${reviewId}/like`, {});
  if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status}`);
  return res.data;
}

// 7. 좋아요 취소
export async function unlikeReview(reviewId: number) {
  const res = await http.delete(`/venue/review/${reviewId}/like`);
  if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status}`);
  return res.data;
}
