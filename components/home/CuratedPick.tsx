import { View, Text, StyleSheet, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import Theme from "@/constants/Theme";
import MagazineCard from "@/components/cards/MagazineCard";
import { fetchMagazineList } from "@/api/MagazineApi";
import { MagazineItem } from "@/types/magazine";

export default function CuratedPick() {
  const router = useRouter();
  const [pickItem, setPickItem] = useState<MagazineItem | null>(null);

  useEffect(() => {
    fetchMagazineList({ limit: 1 }) // 최신 1건
      .then((res) => setPickItem(res[0] || null))
      .catch((err) => console.error("김삼문 pick 조회 실패:", err));
  }, []);

  if (!pickItem) return null;

  return (
    <View style={styles.section}>
      {pickItem && (
        <>
          <Text style={styles.title}>모디 추천 공연</Text>
          <MagazineCard
              item={pickItem}
              onPress={() => router.push(`/magazine/${pickItem.id}`)}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { padding: Theme.spacing.md },
  title: {
    fontSize: Theme.fontSizes.lg,
    fontWeight: Theme.fontWeights.semibold,
    color: Theme.colors.black,
    paddingVertical: Theme.spacing.md,
    textAlign: "center",
  },
});
