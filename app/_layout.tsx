import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot, usePathname } from 'expo-router';

import Header from '@/components/layout/Header';
import TabBar from '@/components/layout/TabBar';

export default function RootLayout() {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {/* 항상 보이는 헤더 (페이지별 props 전달) */}
      <Header pathname={pathname} />

      {/* 현재 페이지 자리 */}
      <View style={styles.page}>
        <Slot />
      </View>

      {/* 항상 보이는 하단바 */}
      <TabBar pathname={pathname} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  page: { flex: 1 },
});
