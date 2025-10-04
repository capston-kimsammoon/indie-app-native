import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import Theme from "@/constants/Theme";
import PerformanceCard from "@/components/cards/PerformanceCard";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { getDateFromDateString } from "@/utils/dateUtils";
import { fetchRecentPerformances } from "@/api/PerformanceApi";
import { Performance } from "@/types/performance";

export default function NewPerformances() {
  const router = useRouter();
  const [items, setItems] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchRecentPerformances(6); // limit 6
      setItems(data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.title}>NEW 업로드 공연</Text>
        <ActivityIndicator size="large" color={Theme.colors.themeOrange} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.title}>NEW 업로드 공연</Text>
        <Text style={{ color: Theme.colors.gray }}>등록된 공연이 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>NEW 업로드 공연</Text>

      <FlatList
        data={items}
        renderItem={({ item }) => (
          <PerformanceCard
            type="new"
            title={item.title}
            date={item.date}
            posterUrl={item.posterUrl || item.thumbnail} // thumbnail도 대응
            onPress={() => router.push(`/performance/${item.id}`)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
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
    alignItems: "center",
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
