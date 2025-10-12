// utils/notificationPermission.ts
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { Platform, Alert, Linking } from "react-native";

// 권한 체크
export const checkNotificationPermission = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") return true;

  const { status: requestStatus } = await Notifications.requestPermissionsAsync();
  if (requestStatus === "granted") return true;

  // 권한 거부
  if (Platform.OS === "ios") {
    Alert.alert(
      "알림 권한 필요",
      "설정 > 알림에서 앱 알림을 허용해주세요.",
      [
        { text: "설정으로 이동", onPress: () => Linking.openSettings() },
        { text: "닫기", style: "cancel" }
      ]
    );
  } else {
    Alert.alert(
      "알림 권한 필요",
      "기기 설정에서 알림을 허용해야 알림을 받을 수 있습니다."
    );
  }

  return false;
};

// 실제 알림 발송 (토글 ON + 권한 허용 시)
export const sendNotification = async (title: string, body: string, alarmToggle: boolean) => {
  if (!alarmToggle) return console.log("알림 토글 OFF: 알림 발송 안함");

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return;
  }

  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null, // 즉시 발송
  });
};

export const usePushNotifications = (onPressNotification: (nid: number, link?: string) => void) => {
  useEffect(() => {
    // Foreground 푸시
    const foregroundSub = Notifications.addNotificationReceivedListener(notification => {
      console.log("Foreground notification:", notification);
      // 필요 시 상태 업데이트 가능
    });

    // Background / 클릭 푸시
    const responseSub = Notifications.addNotificationResponseReceivedListener(response => {
      const nid = response.notification.request.content.data.nid;
      const link = response.notification.request.content.data.link_url;
      onPressNotification(nid, link);
    });

    return () => {
      foregroundSub.remove();
      responseSub.remove();
    };
  }, []);
};