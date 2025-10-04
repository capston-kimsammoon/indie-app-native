// app/layouts/RootLayout.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Slot, Stack, usePathname } from 'expo-router';
import Toast, { ToastConfigParams } from "react-native-toast-message";

import Header from '@/components/layout/Header';
import TabBar from '@/components/layout/TabBar';
import Theme from '@/constants/Theme';
import { ArtistProvider } from '@/context/ArtistContext';
import { requestNotificationPermission, requestLocationPermission } from "@/utils/permissions";

const toastConfig = {
  success: ({ text1 }: ToastConfigParams<string>) => (
    <View style={styles.toastContainer}>
      <Text style={styles.text1}>{text1}</Text>
    </View>
  ),
  error: ({ text1 }: ToastConfigParams<string>) => (
    <View style={[styles.toastContainer, { backgroundColor: '#f56565' }]}>
      <Text style={styles.text1}>{text1}</Text>
    </View>
  )
};

export default function RootLayout() {
  const pathname = usePathname();
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // useEffect(() => {
  //   const checkPermissions = async () => {
  //     try {
  //       // 알림 권한
  //       const notifGranted = await requestNotificationPermission();
  //       if (!notifGranted) {
  //         Alert.alert("알림 권한 필요", "앱 알림을 받으려면 알림 권한을 허용해주세요.");
  //       }

  //       // 위치 권한
  //       const locationGranted = await requestLocationPermission();
  //       if (!locationGranted) {
  //         Alert.alert("위치 권한 필요", "앱 기능 사용을 위해 위치 권한을 허용해주세요.");
  //       }
  //     } catch (err) {
  //       console.warn("권한 체크 중 오류:", err);
  //     } finally {
  //       setLoadingPermissions(false);
  //     }
  //   };

  //   // checkPermissions();
  // }, []);

  if (loadingPermissions) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ArtistProvider>
      <View style={styles.container}>
        <Header pathname={pathname} />

        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ animation: 'none', headerShown: false }}>
            <Slot />
          </Stack>
        </View>

        <TabBar pathname={pathname} />
        <Toast config={toastConfig} />
      </View>
    </ArtistProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toastContainer: {
    padding: Theme.spacing.sm,
    borderRadius: 12,
    backgroundColor: Theme.colors.lightGray,
    shadowColor: Theme.colors.shadow,
    shadowRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 150,
  },
  text1: {
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.medium,
    color: Theme.colors.darkGray,
  }
});
