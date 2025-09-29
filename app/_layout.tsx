import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slot, usePathname } from 'expo-router';
import Toast, { ToastConfigParams } from "react-native-toast-message";

import Header from '@/components/layout/Header';
import TabBar from '@/components/layout/TabBar';

import Theme from '@/constants/Theme';
import { ArtistProvider } from '@/context/ArtistContext';

const toastConfig = {
  success: ({ text1, text2 }: ToastConfigParams<string>) => (
    <View style={styles.toastContainer}>
      <Text style={styles.text1}>{text1}</Text>
    </View>
  ),
};
export default function RootLayout() {
  const pathname = usePathname();

  return (
    <ArtistProvider>

      <View style={styles.container}>
        {/* 항상 보이는 헤더 (페이지별 props 전달) */}
        <Header pathname={pathname} />

        {/* 현재 페이지 자리 */}
        <View style={styles.page}>
          <Slot />
          <Toast config={toastConfig} />
        </View>

        {/* 항상 보이는 하단바 */}
        <TabBar pathname={pathname} />
      </View>
    </ArtistProvider>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  page: { flex: 1 },

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
