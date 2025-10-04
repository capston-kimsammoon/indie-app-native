// app/(tabs)/support.tsx
import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import Theme from "@/constants/Theme";

export default function SupportScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: Theme.spacing.md }}>
      <Text style={styles.title}>고객센터</Text>

      <Text style={styles.paragraph}>
        앱 이용 중 문의사항이나 문제가 발생하면 아래 이메일로 연락주세요.
      </Text>

      <Text style={styles.paragraph}>
        이메일: kimthreemun@gmail.com
      </Text>

      <Text style={styles.paragraph}>
        가능한 빠른 시간 내에 답변 드리겠습니다.  
        친절하고 정확한 지원을 위해 문의 내용을 구체적으로 작성해 주시면 감사드립니다.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  title: {
    fontSize: Theme.fontSizes.xl,
    fontWeight: Theme.fontWeights.bold,
    color: Theme.colors.black,
    marginTop: Theme.spacing.md,
  },
  paragraph: {
    fontSize: Theme.fontSizes.base,
    color: Theme.colors.darkGray,
    lineHeight: 22,
    marginTop: Theme.spacing.md,
  },
});
