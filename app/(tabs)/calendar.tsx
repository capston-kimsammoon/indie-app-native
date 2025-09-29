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

  // region label
  const getRegionLabel = () => {
    if (regions.includes("전체") || regions.length === 0) return "지역: 전체";
    if (regions.length <= 2) return `지역: ${regions.join(", ")}`;
    return `지역: ${regions.slice(0, 2).join(", ")} 외 ${regions.length - 2}곳`;
  };

  // 월별 공연 요약 가져오기
  const loadCalendarSummary = async (year: number, month: number) => {
    try {
      const res = await fetchCalendarSummary(year, month, regions.includes("전체") ? undefined : regions[0]);

      // 날짜별 공연 가져와서 지역 필터 적용
      const filteredDates: string[] = [];
      for (const day of safeArray(res.hasPerformanceDates)) {
        const dateStr = `${res.year}-${String(res.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const performances = await fetchPerformancesByDate(dateStr);

        // 선택한 지역과 겹치는 공연이 있으면 표시
        const dateRegions = performances.region ?? [];
        if (regions.includes("전체") || dateRegions.some(r => regions.includes(r))) {
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
      const res = await fetchPerformancesByDate(date); // res.region: string[]
      const dateRegions = res.region ?? [];
      console.log("dateRegions: ", dateRegions);

      // 전체 선택 시 그대로 반환
      if (selectedRegions.includes("전체")) {
        return safeArray(res.performances);
      }

      // 선택 지역이 날짜의 region과 겹치면 반환
      if (dateRegions.some(r => selectedRegions.includes(r))) {
        return safeArray(res.performances);
      }

      // 겹치지 않으면 빈 배열
      return [];
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
    loadPerformancesForDate(selectedDate, regions).then(data => setPerformancesForDate(data));
  }, [selectedDate, regions]);


  // markedDates
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

  const goToPreviousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.monthWrapper}>
          <TouchableOpacity onPress={goToPreviousMonth} style={{ marginRight: Theme.spacing.sm }}>
            <IcCalendarArrowLeft width={icChevronSize} height={icChevronSize} />
          </TouchableOpacity>
          <Text style={styles.monthText}>{currentDate.getMonth() + 1}월</Text>
          <TouchableOpacity onPress={goToNextMonth} style={{ marginLeft: Theme.spacing.sm }}>
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
        style={{ height: 320 }}
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
