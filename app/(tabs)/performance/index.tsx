// /app/(tabs)/performance/index.tsx
import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";

import FilterButton from "@/components/filters/FilterButton";
import SortFilterModal from "@/components/filters/SortFilterModal";
import RegionFilterModal from "@/components/filters/RegionFilterModal";
import PerformanceCard from "@/components/cards/PerformanceCard";

import { getDateFromDateString, getWeekDayFromDateString } from "@/utils/dateUtils";

import Theme from "@/constants/Theme";
import IcCalendar from "@/assets/icons/ic-calendar.svg";

type Performance = {
  id: string;
  title: string;
  venue: string;
  date: string;
  region: string;
  posterUrl: string;
};

const MOCK_PERFORMANCES: Performance[] = [
  { id: "1", title: "A Place Called Sound", venue: "코멘터리 사운드", date:"2025-09-14", region: "경기", posterUrl: "https://picsum.photos/90/120"},
  { id: "2", title: "bbb", venue: "코멘터리 사운드", date:"2025-09-16", region: "부산", posterUrl: "https://picsum.photos/90/120" },
  { id: "3", title: "ccc", venue: "코멘터리 사운드", date:"2025-09-15", region: "서울", posterUrl: "https://picsum.photos/90/120" },
];

export default function PerformanceListPage() {
  const navigation = useNavigation();
  const router = useRouter();
  const [sort, setSort] = useState("최근등록순");
  const [regions, setRegions] = useState<string[]>(["전체"]);

  const [sortVisible, setSortVisible] = useState(false);
  const [regionVisible, setRegionVisible] = useState(false);

  const getRegionLabel = () => {
    if (regions.includes("전체") || regions.length === 0) return "지역: 전체";
    if (regions.length <= 2) return `지역: ${regions.join(", ")}`;
    return `지역: ${regions.slice(0, 2).join(", ")} 외 ${regions.length - 2}곳`;
  };

  const filteredPerformances = MOCK_PERFORMANCES.filter((p) => {
    if (regions.includes("전체")) return true;
    return regions.includes(p.region);
  });

  return (
    <View style={styles.container}>
      {/* 필터 버튼 + 캘린더 */}
      <View style={styles.filterRow}>
        <FilterButton label={`${sort}`} onPress={() => setSortVisible(true)} />
          <View style={{marginRight: Theme.spacing.sm}} />
        <FilterButton label={getRegionLabel()} onPress={() => setRegionVisible(true)} />
        <View style={styles.flexSpacer} />
        <TouchableOpacity
          style={styles.calendarButton}
          onPress={() => router.push("/calendar")}
        >
          <IcCalendar width={Theme.iconSizes.sm} height={Theme.iconSizes.sm} />
        </TouchableOpacity>
      </View>

      {/* 공연 목록 */}
      <FlatList
        data={filteredPerformances}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PerformanceCard
            type="list"
            title={item.title}
            venue={item.venue}
            date={`${getDateFromDateString(item.date)} ${getWeekDayFromDateString(item.date)}`}
            posterUrl={item.posterUrl}
            onPress={() => router.push(`/performance/${item.id}`)}
          />
        )}
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
      />

      {/* 정렬 모달 */}
      <SortFilterModal
        visible={sortVisible}
        onClose={() => setSortVisible(false)}
        selectedSort={sort}
        onChange={(selected) => setSort(selected)}
      />

      {/* 지역 모달 */}
      <RegionFilterModal
        visible={regionVisible}
        selectedRegions={regions}
        onClose={() => setRegionVisible(false)}
        onChange={(newRegions) => setRegions(newRegions)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: Theme.colors.lightGray,
  },
  flexSpacer: {
    flex: 1,
  },
  calendarButton: {
    height: 30,
    padding: Theme.spacing.sm,
    borderRadius: Theme.iconSizes.md,
    backgroundColor: Theme.colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  separator: {
    height: 1,
    backgroundColor: Theme.colors.lightGray,
  },
});
