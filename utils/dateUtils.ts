// utils/dateUtils.ts
import { format, formatRelative, parseISO, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';

// 요일 한글 매핑
const WEEKDAYS = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

export const getToday = () => {
  const today = new Date();
  const month = today.getMonth() + 1; // 월은 0부터 시작
  const date = today.getDate();
  return `${month}월 ${date}일`;
};

export function getDateFromDateString(dateStr: string): string {
  let dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return ""; // 변환 실패
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}



export function getWeekDayFromDateString(dateStr: string): string {
  const date = new Date(dateStr);
  const dayIndex = date.getDay(); 
  return WEEKDAYS[dayIndex];
}

export const formatDate = (dateInput: string | Date) => {
  const dateObj = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  const weekday = WEEKDAYS[dateObj.getDay()];

  return `${year}.${month}.${day} ${weekday}`;
};


// 오전/오후 + 시/분 처리
export const formatTime = (time?: string) => {
  if (!time) return "";
  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr || "00";

  const isPM = hour >= 12;
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${isPM ? "오후" : "오전"} ${displayHour}시${minute !== "00" ? ` ${minute}분` : ""}`;
};


// 날짜 + 시간 합치기
export const formatDateTime = (dateInput: string | Date, time?: string) => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekday = WEEKDAYS[date.getDay()];

  const base = `${year}.${month}.${day} ${weekday}`;
  return time ? `${base} ${formatTime(time)}` : base;
};

export function formatISODateTime(isoString: string): string {
  const date = new Date(isoString);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // 0~11 -> 1~12
  const day = date.getDate().toString().padStart(2, "0");

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

export function calcDDay(targetDate: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 오늘 날짜만 비교
  const eventDate = new Date(targetDate);
  eventDate.setHours(0, 0, 0, 0);

  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "D - day"; // 오늘
  if (diffDays < 0) return `D + ${Math.abs(diffDays)}`; // 지난 날
  return `D - ${diffDays}`; // 앞으로 남은 날
}

export function formatRelativeTime(dateInput: string | Date): string {
  const now = new Date();
  const targetDate = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

  const diff = now.getTime() - targetDate.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // 1분 미만
  if (seconds < 60) {
    return "방금 전";
  }
  // 1시간 미만
  if (minutes < 60) {
    return `${minutes}분 전`;
  }
  // 24시간 미만
  if (hours < 24) {
    return `${hours}시간 전`;
  }

  // '어제' 처리
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  
  if (targetDate >= startOfYesterday && targetDate < startOfToday) {
    return "어제";
  }

  // 올해 안의 다른 날짜
  if (targetDate.getFullYear() === now.getFullYear()) {
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    return `${month}.${day}`;
  }

  // 작년 이전
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}
