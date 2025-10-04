// app/(tabs)/calendar.tsx
import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from "react-native";
import { CalendarList } from "react-native-calendars";
import { useRouter } from "expo-router";

import Theme from "@/constants/Theme";
import PerformanceCard from "@/components/cards/PerformanceCard";
import FilterButton from "@/components/filters/FilterButton";
import RegionFilterModal from "@/components/filters/RegionFilterModal";
import IcCalendarArrowLeft from "@/assets/icons/ic-calendar-arrow-left.svg";
import IcCalendarArrowRight from "@/assets/icons/ic-calendar-arrow-right.svg";

import { getWeekDayFromDateString } from "@/utils/dateUtils";
import { fetchCalendarSummary, fetchPerformancesByDate } from "@/api/CalendarApi";
import { PerformanceSummary } from "@/types/calendar";
import { safeArray } from "@/utils/safeArray";

const windowHeight = Dimensions.get("window").height;
const calendarHeight = windowHeight * 0.5;

export default function TabCalendarScreen() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [regions, setRegions] = useState<string[]>(["전체"]);
  const [regionVisible, setRegionVisible] = useState(false);

  const [performanceDates, setPerformanceDates] = useState<string[]>([]);
  const [performancesForDate, setPerformancesForDate] = useState<PerformanceSummary[]>([]);

  const calendarRef = useRef<any>(null);
  const icChevronSize = Theme.iconSizes.xs;

  const getRegionLabel = () => {
    if (regions.includes("전체") || regions.length === 0) return "지역: 전체";
    if (regions.length <= 2) return `지역: ${regions.join(", ")}`;
    return `지역: ${regions.slice(0, 2).join(", ")} 외 ${regions.length - 2}곳`;
  };

  // 월별 공연 요약
  const loadCalendarSummary = async (year: number, month: number) => {
    try {
      const regionParam = regions.includes("전체") ? undefined : regions[0];
      const res = await fetchCalendarSummary(year, month, regionParam);

      const filteredDates: string[] = [];
      for (const day of safeArray(res.hasPerformanceDates)) {
        const dateStr = `${res.year}-${String(res.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const performances = await fetchPerformancesByDate(dateStr, regions.includes("전체") ? undefined : regions);

        // 선택한 지역과 겹치는 공연이 있으면 표시
        if (performances.performances.some(p => regions.includes("전체") || regions.includes(p.region))) {
          filteredDates.push(dateStr);
        }
      }
      setPerformanceDates(filteredDates);

    } catch (err) {
      console.error("캘린더 요약 조회 실패:", err);
      setPerformanceDates([]);
    }
  };

  // 선택한 날짜 공연 가져오기 + region 필터 적용
  const loadPerformancesForDate = async (date: string, selectedRegions: string[] = []) => {
    try {
      const res = await fetchPerformancesByDate(date, selectedRegions.includes("전체") ? undefined : selectedRegions);
      const performances = safeArray(res.performances);

      // 전체 선택 시 그대로 반환
      if (selectedRegions.includes("전체")) return performances;

      // 선택 지역과 공연 region 겹치는 것만 반환
      return performances.filter(p => selectedRegions.includes(p.region));
    } catch (error) {
      console.error("날짜별 공연 로드 실패:", error);
      return [];
    }
  };

  // 초기 로딩 & 월 변경 시
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    loadCalendarSummary(year, month);
  }, [currentDate, regions]);

  // 날짜 선택 시 공연 리스트 로딩
  useEffect(() => {
    loadPerformancesForDate(selectedDate, regions).then(setPerformancesForDate);
  }, [selectedDate, regions]);

  const markedDates = performanceDates.reduce((acc, date) => {
    acc[date] = {
      customStyles: {
        container: {
          borderWidth: 1,
          borderColor: Theme.colors.themeOrange,
          borderRadius: 20,
          width: 36,
          height: 36,
          justifyContent: "center",
          alignItems: "center",
        },
        text: { color: Theme.colors.black },
      },
    };
    return acc;
  }, {} as any);

  // 선택한 날짜 표시
  if (selectedDate) {
    markedDates[selectedDate] = {
      customStyles: {
        container: {
          backgroundColor: Theme.colors.themeOrange,
          borderRadius: 20,
          width: 36,
          height: 36,
          justifyContent: "center",
          alignItems: "center",
        },
        text: { color: Theme.colors.white },
      },
    };
  }

  // 오늘 날짜 점 표시
  if (!markedDates[today]) markedDates[today] = {};
  const isTodaySelected = today === selectedDate;
  markedDates[today] = {
    ...markedDates[today],
    marked: true,
    dotColor: isTodaySelected ? Theme.colors.lightGray : Theme.colors.themeOrange,
    customStyles: markedDates[today].customStyles || undefined,
  };

  const getWeeksInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month - 1, 1).getDay(); // 0:일 ~ 6:토
    const lastDate = new Date(year, month, 0).getDate(); // 해당 달 마지막 날짜
    return Math.ceil((firstDay + lastDate) / 7);
  };

  const weeks = getWeeksInMonth(currentDate.getFullYear(), currentDate.getMonth() + 1);
  const rowHeight = 50; // 한 주 높이
  const calendarHeight = rowHeight * weeks + 50; // +50은 헤더 높이

  const goToPreviousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.monthWrapper}>
          <TouchableOpacity onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} style={{ marginRight: Theme.spacing.sm }}>
            <IcCalendarArrowLeft width={icChevronSize} height={icChevronSize} />
          </TouchableOpacity>
          <Text style={styles.monthText}>{currentDate.getMonth() + 1}월</Text>
          <TouchableOpacity onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} style={{ marginLeft: Theme.spacing.sm }}>
            <IcCalendarArrowRight width={icChevronSize} height={icChevronSize} />
          </TouchableOpacity>
        </View>
        <FilterButton label={getRegionLabel()} onPress={() => setRegionVisible(true)} />
      </View>

      <CalendarList
        ref={calendarRef}
        horizontal
        pagingEnabled
        hideArrows
        calendarWidth={Dimensions.get("window").width}
        style={{ height: calendarHeight }}
        current={currentDate.toISOString().split("T")[0]}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        markingType="custom"
        renderHeader={() => null}
        onVisibleMonthsChange={(months) => setCurrentDate(new Date(months[0].timestamp))}
        dayNamesShort={["일", "월", "화", "수", "목", "금", "토"]}
        theme={{
          textDayFontSize: Theme.fontSizes.base,
          textDayHeaderFontSize: Theme.fontSizes.sm,
          textDayHeaderFontWeight: Theme.fontWeights.semibold,
          textDayFontWeight: Theme.fontWeights.semibold,
          dayTextColor: Theme.colors.black,
          monthTextColor: Theme.colors.black,
          todayTextColor: Theme.colors.black,
          textSectionTitleColor: Theme.colors.black,
          backgroundColor: Theme.colors.white,
        }}
      />

      <Text style={styles.dateText}>
        {new Date(selectedDate).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}{" "}
        {getWeekDayFromDateString(selectedDate)} 공연
      </Text>

      <FlatList
        data={performancesForDate}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        contentContainerStyle={styles.cardList}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <PerformanceCard
              type="calendar"
              title={item.title}
              venue={item.venue}
              posterUrl={item.thumbnail}
              onPress={() => router.push(`/performance/${item.id}`)}
            />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>선택한 날짜에 공연이 없습니다</Text>}
      />

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
  container: { flex: 1, backgroundColor: Theme.colors.white },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.sm },
  monthWrapper: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  monthText: { fontSize: Theme.fontSizes.lg, fontWeight: Theme.fontWeights.semibold, color: Theme.colors.black },
  dateText: { fontSize: Theme.fontSizes.base, fontWeight: Theme.fontWeights.semibold, padding: Theme.spacing.md },
  cardList: { paddingHorizontal: Theme.spacing.sm, backgroundColor: Theme.colors.white },
  cardWrapper: { width: `${100 / 3}%`, padding: Theme.spacing.xs },
  emptyText: { textAlign: "center", marginTop: Theme.spacing.lg, color: Theme.colors.gray },
});
