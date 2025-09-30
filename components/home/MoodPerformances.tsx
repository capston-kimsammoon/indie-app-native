// components/home/MoodPerformances.tsx
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import Theme from "@/constants/Theme";
import PerformanceCard from "@/components/cards/PerformanceCard";
import { useRouter } from "expo-router";
import { fetchMoods, fetchPerformancesByMood } from "@/api/MoodApi";

// 항상 표시할 무드 버튼
const MOODS = ["신나는", "차분한", "따뜻한", "짜릿한"] as const;
type Mood = typeof MOODS[number];

export default function MoodPerformances() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<Mood>(MOODS[0]);
  const [performances, setPerformances] = useState<any[]>([]);

  // 선택된 무드 공연 API 호출
  useEffect(() => {
    const loadPerformances = async () => {
      try {
        // 실제 API에서 무드 ID 매핑 필요 (임시: index+1)
        const moodId = MOODS.indexOf(selectedMood) + 1;
        const list = await fetchPerformancesByMood(moodId);
        setPerformances(list);
      } catch (err) {
        console.error(`${selectedMood} 공연 불러오기 실패`, err);
        setPerformances([]);
      }
    };
    loadPerformances();
  }, [selectedMood]);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Mood별 공연</Text>

      {/* 무드 버튼 */}
      <View style={styles.buttonRow}>
        {MOODS.map((mood) => {
          const active = mood === selectedMood;
          return (
            <TouchableOpacity
              key={mood}
              style={[
                styles.moodButton,
                active && { backgroundColor: Theme.colors.themeOrange },
              ]}
              onPress={() => setSelectedMood(mood)}
            >
              <Text
                style={[
                  styles.moodButtonText,
                  active && { color: Theme.colors.white },
                ]}
              >
                {mood}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 공연 리스트 */}
      <FlatList
        data={performances}
        renderItem={({ item }) => (
          <PerformanceCard
            type="mood"
            title={item.title}
            date={item.date}
            posterUrl={item.image_url}
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
  section: { padding: Theme.spacing.md },
  title: {
    fontSize: Theme.fontSizes.lg,
    fontWeight: Theme.fontWeights.semibold,
    color: Theme.colors.black,
    textAlign: "center",
    paddingVertical: Theme.spacing.md,
  },
  buttonRow: { flexDirection: "row", paddingVertical: Theme.spacing.md },
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
  list: { paddingRight: Theme.spacing.md },
});
