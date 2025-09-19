// 3. 인기 많은 공연
// components/home/PopularPerformances.tsx
import { View, Text, StyleSheet, FlatList } from "react-native";
import Theme from "@/constants/Theme";
import PerformanceCard from "@/components/cards/PerformanceCard";
import { useRouter } from "expo-router";
import { getDateFromDateString } from "@/utils/dateUtils";

const POPULAR_PERFORMANCES = [
  { id: "1", title: "어둠속 빛나는 광채 ‘DARK Radiance’", venue: "홍대 클럽", date: "2025-09-12", posterUrl: "https://picsum.photos/90/120" },
  { id: "2", title: "오늘 공연 2", venue: "강남 공연장", date: "2025-09-12", posterUrl: "https://picsum.photos/90/120" },
  { id: "3", title: "오늘 공연 3", venue: "이태원 공연장", date: "2025-09-12", posterUrl: "https://picsum.photos/90/120" },
];

export default function PopularPerformances() {
  const router = useRouter();
  
  return (
    <View style={styles.section}>
      <Text style={styles.title}>인기 많은 공연</Text>

      <FlatList
        data={POPULAR_PERFORMANCES}
        renderItem={({ item }) => (
          <PerformanceCard
            type="popular"
            title={item.title}
            date={getDateFromDateString(item.date)}
            posterUrl={item.posterUrl}
            onPress={() => router.push(`/performance/${item.id}`)}
          />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.fontSizes.lg,
    fontWeight: Theme.fontWeights.semibold,
    color: Theme.colors.black,
    paddingVertical: Theme.spacing.md,
    textAlign: "center",
  },
  list: {
    paddingRight: Theme.spacing.md,
  },
});
