// types/calendar.ts
export interface PerformanceSummary {
  id: number | string;
  title: string;
  venue: string;
  thumbnail: string;
}

export interface CalendarSummaryResponse {
  year: number;
  month: number;
  hasPerformanceDates: number[];
}

export interface PerformancesByDateResponse {
  date: string;
  region: string[];
  performances: PerformanceSummary[];
}
