// types/notification.ts
export type NotificationType =
  | "ticket_open"                  // 예매 오픈 알림
  | "favorite_performance_d1"      // 공연 찜 D-1 알림
  | "new_performance"              // 신규 공연 알림
  | "performance_like"
  | "artist_performance"
  | "artist_like"
  | "review_like";

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
  payload?: any;
}
