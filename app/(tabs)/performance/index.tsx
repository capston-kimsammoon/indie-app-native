// /app/(tabs)/performance/index.tsx
import React, { useState, useEffect } from "react";
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

import FilterButton from "@/components/filters/FilterButton";
import SortFilterModal from "@/components/filters/SortFilterModal";
import RegionFilterModal from "@/components/filters/RegionFilterModal";
import PerformanceCard from "@/components/cards/PerformanceCard";

import { getDateFromDateString, getWeekDayFromDateString } from "@/utils/dateUtils";
import { fetchPerformances } from "@/api/PerformanceApi";

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

export default function PerformanceListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [sort, setSort] = useState("최근등록순");
  const [regions, setRegions] = useState<string[]>(["전체"]);
  const [performances, setPerformances] = useState<Performance[]>([]);

  const [sortVisible, setSortVisible] = useState(false);
  const [regionVisible, setRegionVisible] = useState(false);

  // Performance 객체 포맷팅
  const formatPerformance = (p: any): Performance => ({
    id: String(p.id),
    title: p.title,
    venue: p.venue,
    date: p.date,
    region: p.region || "알 수 없음",
    posterUrl: p.thumbnail,
  });

  const loadPerformances = async (page: number = 1) => {
    if (loading || page > totalPages) return;
    setLoading(true);
    try {
      const res = await fetchPerformances(regions, sort, page, 20);
      setTotalPages(res.totalPages || 1);

      setPerformances(prev =>
        page === 1
          ? res.performances.map((p: any) => formatPerformance(p))
          : [...prev, ...res.performances.map((p: any) => formatPerformance(p))]
      );
      setCurrentPage(page);

    } catch (err) {
      console.error("공연 목록 조회 실패:", err);
      setPerformances([]);
    } finally {
      setLoading(false);
    }
  };

  // 지역이나 정렬 변경 시 다시 호출
  useEffect(() => {
    loadPerformances(1);
  }, [regions, sort]);
  const getRegionLabel = () => {
    if (regions.includes("전체") || regions.length === 0) return "지역: 전체";
    if (regions.length <= 2) return `지역: ${regions.join(", ")}`;
    return `지역: ${regions.slice(0, 2).join(", ")} 외 ${regions.length - 2}곳`;
  };

  return (
    <View style={styles.container}>
      {/* 필터 버튼 + 캘린더 */}
      <View style={styles.filterRow}>
        <FilterButton label={`${sort}`} onPress={() => setSortVisible(true)} />
        <View style={{ marginRight: Theme.spacing.sm }} />
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
        data={performances}
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
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onEndReached={() => loadPerformances(currentPage + 1)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={ loading ? <ActivityIndicator style={{ margin: Theme.spacing.sm }} /> : null }
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
    padding: Theme.spacing.md,
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
