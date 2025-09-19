// 7. Mood별 공연
// components/home/MoodPerformances.tsx
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useState } from "react";
import Theme from "@/constants/Theme";
import PerformanceCard from "@/components/cards/PerformanceCard";
import { useRouter } from "expo-router";

type Mood = "신나는" | "차분한" | "따뜻한" | "짜릿한";

const MOODS: Mood[] = ["신나는", "차분한", "따뜻한", "짜릿한"];

const MOOD_ITEMS: Record<Mood, {
  id: string;
  title: string;
  venue: string;
  date: string;
  posterUrl: string;
}[]> = {
  "신나는": [
    { id: "1", title: "신나는 공연 1", venue: "홍대 클럽", date: "2025.09.12", posterUrl: "https://picsum.photos/90/120" },
    { id: "2", title: "신나는 공연 2", venue: "강남 공연장", date: "2025.09.12", posterUrl: "https://picsum.photos/90/120" },
    { id: "3", title: "신나는 공연 2", venue: "강남 공연장", date: "2025.09.12", posterUrl: "https://picsum.photos/90/120" },
  ],
  "차분한": [
    { id: "3", title: "차분한 공연 1", venue: "홍대 클럽", date: "2025.09.12", posterUrl: "https://picsum.photos/90/120" },
  ],
  "따뜻한": [
    { id: "4", title: "따뜻한 공연 1", venue: "이태원 클럽", date: "2025.09.12", posterUrl: "https://picsum.photos/90/120" },
  ],
  "짜릿한": [
    { id: "5", title: "짜릿한 공연 1", venue: "강남 공연장", date: "2025.09.12", posterUrl: "https://picsum.photos/90/120" },
  ],
};

export default function MoodPerformances() {
  const router = useRouter();

  const [selectedMood, setSelectedMood] = useState<Mood>(MOODS[0]);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Mood별 공연</Text>

      {/* 무드 버튼 */}
      <View style={styles.buttonRow}>
        {MOODS.map((mood) => (
          <TouchableOpacity
            key={mood}
            style={[
              styles.moodButton,
              selectedMood === mood && { backgroundColor: Theme.colors.themeOrange },
            ]}
            onPress={() => setSelectedMood(mood)}
          >
            <Text
              style={[
                styles.moodButtonText,
                selectedMood === mood && { color: Theme.colors.white },
              ]}
            >
              {mood}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 선택된 무드 공연 리스트 */}
      <FlatList
        data={MOOD_ITEMS[selectedMood]}
        renderItem={({ item }) => (
          <PerformanceCard
            type="mood"
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
  buttonRow: {
    flexDirection: "row",
    paddingVertical: Theme.spacing.md,
  },
  moodButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    marginRight: Theme.spacing.sm,
  },
  moodButtonText: {
    fontSize: Theme.fontSizes.sm,
    fontWeight: Theme.fontWeights.medium,
  },
  list: {
    paddingRight: Theme.spacing.md,
  },
});
