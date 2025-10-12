// api/NotificationApi.ts
import http from "./http";
import { NotificationItem } from "@/types/notification";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

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

export const registerPushToken = async () => {
  if (!Constants.isDevice) return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return;

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;

  // 서버에 토큰 저장
  await http.post("/users/me/push-token", { token });
};