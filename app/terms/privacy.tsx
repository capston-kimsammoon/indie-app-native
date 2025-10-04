// app/terms/service.tsx
import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import Theme from '@/constants/Theme';

export default function privacyTermsPage() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>개인정보처리방침</Text>
        <Text style={styles.content}>
          {/* 여기서 실제 약관 내용을 넣습니다 */}
          1. 서비스 이용에 대한 약관 내용…
          2. 이용자의 권리와 의무…
          3. 기타 안내…
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.white },
  scroll: { padding: Theme.spacing.md },
  title: { fontSize: Theme.fontSizes.lg, fontWeight: 'bold', marginBottom: Theme.spacing.md },
  content: { fontSize: Theme.fontSizes.base, lineHeight: 24 },
});
