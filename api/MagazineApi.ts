import http from './http';
import { safeArray } from "@/utils/safeArray";
import { MagazineItem, MagazineContentBlock} from '@/types/magazine';

/** 카드 표준화 */
const normalizeMagazineCard = (m: any): MagazineItem => ({
  id: m?.id ?? m?.magazine_id ?? null,
  title: m?.title ?? "",
  content: m?.excerpt ?? m?.summary ?? m?.content ?? "",
  createdAt: m?.created_at ?? m?.createdAt ?? null,
  images: m?.images?.map((img: any) => ({
    id: img?.id,
    imageUrl: img?.image_url ?? img?.imageUrl ?? "",
  })),
  coverImageUrl: m?.coverImageUrl ?? m?.cover_image_url ?? null,
});


const normalizeMagazineDetail = (m: any): MagazineItem => ({
  id: m?.id ?? m?.magazine_id ?? null,
  title: m?.title ?? "",
  date: m?.created_at ?? m?.createdAt ?? null,
  coverImageUrl: m?.cover_image_url ?? m?.coverImageUrl ?? null,
  contents: m?.blocks?.map((b: any): MagazineContentBlock => {
    const type = b.type?.toLowerCase();
    switch (type) {
      case "text":
      case "quote":
      case "divider":
        return { type, value: b.text ?? "" };
      case "image":
      case "embed":
        return { 
          type, 
          value: b.image_url ?? b.imageUrl ?? "",
          align: (b.align ?? b.meta?.align ?? "center").toLowerCase() as "left" | "center" | "right"
        };
      default:
        return { type: "text", value: "" }; // 알 수 없는 타입은 빈 텍스트 처리
    }
  }) ?? [],
});


/**
 * 매거진 목록 조회
 * GET /magazine
 */
export const fetchMagazineList = async (params?: {
  limit?: number;
  page?: number;
  size?: number;
}): Promise<MagazineItem[]> => {
  try {
    const { data } = await http.get(`/magazine`, { params });
    return safeArray(data).map(normalizeMagazineCard);
  } catch (error: any) {
    console.error("매거진 목록 조회 실패:", error?.response?.data || error.message);
    return [];
  }
};

/**
 * 매거진 상세 조회
 * GET /magazine/{id}
 */
export const fetchMagazineDetail = async (idOrSlug: string | number) => {
  try {
    const { data } = await http.get(`/magazine/${idOrSlug}`);
    return normalizeMagazineDetail(data);
  } catch (error: any) {
    console.error("매거진 상세 조회 실패:", error?.response?.data || error.message);
    return null;
  }
};