// 6. 김삼문 pick!
// components/home/CuratedPick.tsx
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Theme from "@/constants/Theme";
import PerformanceCard from "@/components/cards/PerformanceCard";

const PICK_ITEMS = [
  {
    id: "1",
    title: "김삼문 Pick 1",
    content: "이번 주 추천 공연 정보와 간단 설명",
    posterUrl: "https://picsum.photos/400/200",
  },
];

export default function CuratedPick({ onPress }: { onPress?: () => void }) {
  const router = useRouter();
  const pickItem = PICK_ITEMS[0];

  return (
    <View style={styles.section}>
      <Text style={styles.title}>김삼문 pick!</Text>
        <PerformanceCard
          type="pick"
          title={pickItem.title}
          content={pickItem.content}
          posterUrl={pickItem.posterUrl}
          onPress={() => router.push(`/magazine`)}
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
});
