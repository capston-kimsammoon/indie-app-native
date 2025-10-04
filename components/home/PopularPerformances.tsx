// 3. 인기 많은 공연
// components/home/PopularPerformances.tsx
import { View, Text, StyleSheet, FlatList } from "react-native";
import Theme from "@/constants/Theme";
import PerformanceCard from "@/components/cards/PerformanceCard";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { fetchPopularPerformances } from "@/api/PerformanceApi";
import { Performance } from "@/types/performance";

export default function PopularPerformances() {
  const router = useRouter();
  const [performances, setPerformances] = useState<Performance[]>([]);
  
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPopularPerformances(6);
        setPerformances(data);
      } catch (e) {
        console.error("인기 많은 공연 불러오기 실패:", e);
      }
    };
    load();
  }, []);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>인기 많은 공연</Text>

      <FlatList
        data={performances}
        renderItem={({ item }) => (
          <PerformanceCard
            type="popular"
            title={item.title}
            date={item.date}
            posterUrl={item.posterUrl || item.thumbnail}
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
