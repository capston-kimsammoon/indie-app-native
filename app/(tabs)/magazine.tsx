import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import Theme from "@/constants/Theme";
import { formatISODateTime } from "@/utils/dateUtils";

export default function MagazinePage() {
  // 서버에서 가져온 데이터라고 가정
  const magazine = {
    title: "홍대 인디밴드 인터뷰",
    date: "2025-09-18T09:37:36.000Z",
    contents: [
      { type: "TEXT", value: "홍대에서 만난 인디밴드의 첫 공연 이야기..." },
      { type: "IMAGE", value: "https://picsum.photos/400/200" },
      { type: "TEXT", value: "공연 준비 과정에서 있었던 에피소드..." },
      { type: "IMAGE", value: "https://picsum.photos/400/250" }
    ]
  };

  return (
    <ScrollView style={styles.container}>
      {/* 제목 + 날짜 */}
      <View style={styles.header}>
        <Text style={styles.title}>{magazine.title}</Text>
        <Text style={styles.date}>{formatISODateTime(magazine.date)}</Text>
      </View>

      {/* 구분선 */}
      <View style={styles.separator} />

      {/* 본문 */}
      <View style={styles.contentWrapper}>
        {magazine.contents.map((block, index) =>
          block.type === "TEXT" ? (
            <Text key={index} style={styles.contentText}>
              {block.value}
            </Text>
          ) : (
            <Image
              key={index}
              source={{ uri: block.value }}
              style={styles.contentImage}
              resizeMode="cover"
            />
          )
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  header: {
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.fontSizes.lg,
    fontWeight: Theme.fontWeights.semibold,
    color: Theme.colors.black,
    textAlign: "center",
    marginBottom: Theme.spacing.md,
  },
  date: {
    fontSize: Theme.fontSizes.xs,
    color: Theme.colors.gray,
    textAlign: "right",
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.lightGray,
  },
  contentWrapper: {
    gap: Theme.spacing.lg,
    padding: Theme.spacing.md,
  },
  contentText: {
    fontSize: Theme.fontSizes.sm,
    lineHeight: Theme.spacing.lg,
    color: Theme.colors.black,
    fontWeight: Theme.fontWeights.regular,
  },
  contentImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
});
