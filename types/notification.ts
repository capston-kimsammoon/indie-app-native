export type NotificationType =
  | "ticket_open"
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
