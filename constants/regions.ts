// constants/regions.ts

export const REGION_OPTIONS = [
  "전체",
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "광주",
  "대전",
  "울산",
  "세종",
  "강원",
  "충청",
  "전라",
  "경상",
  "제주",
] as const;

export type RegionType = (typeof REGION_OPTIONS)[number];
