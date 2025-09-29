export type MagazineItem = {
  id: number | string;
  title: string;
  date?: string | null;
  coverImageUrl?: string | null;
  contents: MagazineContentBlock[]; // 본문 블록 배열
};

export interface MagazineResponse {
  magazine: MagazineItem[];
}

export type MagazineContentBlock = {
  type: "text" | "image" | "quote" | "embed" | "divider";
  value: string;
  align?: "left" | "center" | "right";
};