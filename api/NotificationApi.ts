import http from "./http";
import { NotificationItem } from "@/types/notification";

export const fetchNotifications = async (): Promise<NotificationItem[]> => {
  try {
    const res = await http.get("/notifications");
    return res.data ?? [];
  } catch (e) {
    console.error("fetchNotifications error:", e);
    return [];
  }
};

export const removeNotification = async (id: number) => {
  try {
    await http.delete(`/notifications/${id}`);
    return true;
  } catch (e) {
    console.error("removeNotification error:", e);
    return false;
  }
};

export const markNotificationRead = async (id: number) => {
  return http.patch(`/notifications/${id}/read`);
};