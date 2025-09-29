// app/MoodApi.ts
import http from './http';
import { safeArray } from "@/utils/safeArray";

// 무드 목록 가져오기
export const fetchMoods = async (): Promise<{ id: number; name: string }[]> => {
  try {
    const response = await http.get(`/mood`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.error("무드 목록 조회 실패:", error.response?.data || error.message);
    return [];
  }
};

// 특정 무드별 공연 조회
export const fetchPerformancesByMood = async (
  moodId: number
): Promise<
  {
    id: number;
    title: string;
    image_url: string;
    date: string;
    venue?: { id: number; name: string } | null;
  }[]
> => {
  try {
    const response = await http.get(`/mood/${moodId}/performances`);
    // response.data.performances 배열이 기본
    return Array.isArray(response.data?.performances)
      ? response.data.performances
      : [];
  } catch (error) {
    console.error(`무드(${moodId}) 공연 조회 실패:`, error.response?.data || error.message);
    return [];
  }
};
