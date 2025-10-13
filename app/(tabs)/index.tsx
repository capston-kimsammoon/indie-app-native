// app/(tabs)/index.tsx
import { ScrollView, StyleSheet, View, Text, Pressable } from "react-native";
import Theme from "@/constants/Theme";
import { useRouter } from "expo-router";

// 홈 화면에 쓸 컴포넌트들
import TodayPerformances from "@/components/home/TodayPerformances";
import NavigationButtons from "@/components/home/NavigationButtons";
import PopularPerformances from "@/components/home/PopularPerformances";
import NewPerformances from "@/components/home/NewPerformances";
import UpcomingTickets from "@/components/home/UpcomingTickets";
import PickSection from "@/components/home/CuratedPick";
import MoodPerformances from "@/components/home/MoodPerformances";

export default function TabHomeScreen() {
  const router = useRouter();
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. 오늘 날짜 공연 */}
      <TodayPerformances />

      {/* 2. 다른 페이지 이동 버튼 섹션 */}
      <NavigationButtons />

      {/* 3. 인기 많은 공연 */}
      <PopularPerformances />

      {/* 4. NEW 업로드 공연 */}
      <NewPerformances />

      {/* 5. 티켓 오픈 예정 */}
      <UpcomingTickets />

      {/* 6. Pick! */}
      <PickSection />

      {/* 7. Mood별 공연 */}
      <MoodPerformances />

      {/* 맨 아래 약관 정보 */}
      <View style={styles.footer}>
        <View style={styles.terms}>
          <Pressable style={styles.termsItem} onPress={() => router.push('/terms/service')}>
            <Text style={styles.footerText}>이용약관</Text>
          </Pressable>
          <Pressable style={styles.termsItem} onPress={() => router.push('/terms/location')}>
            <Text style={styles.footerText} numberOfLines={1} ellipsizeMode="tail">
              위치기반서비스이용약관
            </Text>
          </Pressable>
          <Pressable style={styles.termsItem} onPress={() => router.push('/terms/privacy')}>
            <Text style={styles.footerText}>개인정보처리방침</Text>
          </Pressable>
        </View>
        <Text style={styles.footerText}>© modie corp</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  contentContainer: {
    // paddingVertical: Theme.spacing.lg,
  },
  footer: {
    marginTop: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.lightGray,
    alignItems: "center",
  },
  terms: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
  },
  termsItem: {
    flex: 1,           
  },
  footerText: {
    fontSize: Theme.fontSizes.xs,
    color: Theme.colors.gray,
    textAlign: "center", 
  },
  divider: {
    color: Theme.colors.gray,
    textAlign: "center",
    alignContent: "center",
  },
});
