// 4. NEW 업로드 공연
// components/home/NewPerformances.tsx
import { View, Text, StyleSheet, FlatList } from "react-native";
import Theme from "@/constants/Theme";
import PerformanceCard from "@/components/cards/PerformanceCard";

const NEW_PERFORMANCES = [
  { id: "1", title: "오늘 공연 1", venue: "홍대 클럽", date: "2025.09.12", posterUrl: require('../../assets/images/sample-poster1.jpeg') },
  { id: "2", title: "오늘 공연 2", venue: "강남 공연장", date: "2025.09.12", posterUrl: require('../../assets/images/sample-poster1.jpeg') },
  { id: "3", title: "오늘 공연 3", venue: "이태원 공연장", date: "2025.09.12", posterUrl: require('../../assets/images/sample-poster1.jpeg') },
];

export default function NewPerformances() {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>NEW 업로드 공연</Text>

      <FlatList
        data={NEW_PERFORMANCES}
        renderItem={({ item }) => (
          <PerformanceCard
            type="new"
            title={item.title}
            venue={item.venue}
            date={item.date}
            posterUrl={item.posterUrl}
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
