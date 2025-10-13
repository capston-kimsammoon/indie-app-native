// app/layouts/RootLayout.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Linking } from 'react-native';
import { Slot, Stack, usePathname, useRouter, useSegments } from 'expo-router';
import Toast, { ToastConfigParams } from "react-native-toast-message";

import Header from '@/components/layout/Header';
import TabBar from '@/components/layout/TabBar';
import Theme from '@/constants/Theme';
import { ArtistProvider } from '@/context/ArtistContext';
import { useAuthStore } from '@/src/state/authStore';
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import http from "@/api/http";

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
  const router = useRouter();
  const segments = useSegments();
  const { user, hydrated } = useAuthStore();
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // 온보딩 체크
  useEffect(() => {
    // hydration이 완료될 때까지 대기
    if (!hydrated) {
      console.log("[LAYOUT] Not hydrated yet, waiting...");
      return;
    }

    if (!isMounted.current) return;

    console.log("[LAYOUT] Check onboarding - segments:", segments, "user:", user);

    // 온보딩/로그인 화면은 스킵
    if (segments[0] === "onboarding" || segments[0] === "login") {
      console.log("[LAYOUT] In onboarding/login, skip check");
      return;
    }

    // 사용자가 없으면 스킵 (로그아웃 상태)
    if (!user) {
      console.log("[LAYOUT] No user, skip check");
      return;
    }

    // 프로필 미완료 체크 (회원가입 직후에만 해당)
    if (user.is_completed === false) {
      console.log("[LAYOUT] User not completed, redirecting to onboarding...");

      setTimeout(() => {
        if (isMounted.current) {
          router.replace("/onboarding/terms");
        }
      }, 100);
    } else {
      console.log("[LAYOUT] User completed or no check needed, is_completed:", user.is_completed);
    }
  }, [user, segments, hydrated]);

  // hydration 중에는 로딩 표시
  if (!hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  useEffect(() => {
    const setupPushNotifications = async () => {
      try {
        if (!Constants.isDevice) return;

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          Alert.alert(
            "알림 권한 필요",
            "앱 알림을 받으려면 권한을 허용해주세요.",
            [
              { text: "설정으로 이동", onPress: () => Linking.openSettings() },
              { text: "닫기", style: "cancel" }
            ]
          );
          return;
        }

        // Expo Push Token 발급 및 서버 등록
        const tokenData = await Notifications.getExpoPushTokenAsync();
        await http.post("/users/me/push-token", { token: tokenData.data });

      } catch (err) {
        console.warn("알림 권한 체크/토큰 발급 오류:", err);
      } finally {
        setLoadingPermissions(false);
      }
    };

    setupPushNotifications();
  }, []);

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
          <Stack screenOptions={{ animation: 'none', headerShown: false, detachPreviousScreen: false }}>
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