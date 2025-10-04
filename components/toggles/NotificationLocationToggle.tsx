// components/toggles/NotificationLocationToggle.tsx
import React, { useState, useEffect } from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { requestNotificationPermission, requestLocationPermission } from "@/utils/permissions";

export default function NotificationLocationToggle() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);

  const toggleNotifications = async (val: boolean) => {
    if (val) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }
    setNotificationsEnabled(val);
  };

  const toggleLocation = async (val: boolean) => {
    if (val) {
      const granted = await requestLocationPermission();
      if (!granted) return;
    }
    setLocationEnabled(val);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text>앱 알림</Text>
        <Switch value={notificationsEnabled} onValueChange={toggleNotifications} />
      </View>
      <View style={styles.row}>
        <Text>위치 정보 사용</Text>
        <Switch value={locationEnabled} onValueChange={toggleLocation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
});
