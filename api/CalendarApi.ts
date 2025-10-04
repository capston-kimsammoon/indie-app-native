// app/api/CalendarApi.ts
import http from './http';
import { safeArray } from "@/utils/safeArray";
import { CalendarSummaryResponse, PerformancesByDateResponse } from "@/types/calendar";

export const fetchCalendarSummary = async (
  year: number,
  month: number,
  region?: string
): Promise<CalendarSummaryResponse> => {
  try {
    const params: Record<string, any> = { year, month };
    if (region) params.region = [region];

    const { data } = await http.get<CalendarSummaryResponse>(
      "/calendar/summary",
      { params }
    );

    return {
      ...data,
      hasPerformanceDates: safeArray<number>(data.hasPerformanceDates),
    };
  } catch (error) {
    console.error("캘린더 요약 조회 실패:", error);
    throw error;
  }
};

export const fetchPerformancesByDate = async (
  date: string,
  regions?: string[]
): Promise<PerformancesByDateResponse> => {
  try {
    const { data } = await http.get<PerformancesByDateResponse>(
      "/calendar/performance/by-date",
      { params: { date, region: regions } }
    );
    return data;
  } catch (error) {
    console.error("날짜별 공연 조회 실패:", error);
    throw error;
  }
};
