// 4. NEW 업로드 공연
// components/home/NewPerformances.tsx
import { View, Text, StyleSheet, FlatList } from "react-native";
import Theme from "@/constants/Theme";
import PerformanceCard from "@/components/cards/PerformanceCard";
import { useRouter } from "expo-router";

const NEW_PERFORMANCES = [
  { id: "1", title: "오늘 공연 1", venue: "홍대 클럽", date: "2025.09.12", posterUrl: "https://picsum.photos/90/120" },
  { id: "2", title: "오늘 공연 2", venue: "강남 공연장", date: "2025.09.12", posterUrl: "https://picsum.photos/90/120" },
  { id: "3", title: "오늘 공연 3", venue: "이태원 공연장", date: "2025.09.12", posterUrl: "https://picsum.photos/90/120" },
  { id: "4", title: "오늘 공연 3", venue: "이태원 공연장", date: "2025.09.12", posterUrl: "https://picsum.photos/90/120" },
];

export default function NewPerformances() {
  const router = useRouter();
  
  return (
    <View style={styles.section}>
      <Text style={styles.title}>NEW 업로드 공연</Text>

      <FlatList
        data={NEW_PERFORMANCES}
        renderItem={({ item }) => (
          <PerformanceCard
            type="new"
            title={item.title}
            date={item.date}
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
