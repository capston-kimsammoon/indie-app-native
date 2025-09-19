// app/(tabs)/calendar/index.tsx
import React, { useState, useRef } from "react";
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from "react-native";
import { Calendar, CalendarList  } from "react-native-calendars";
import Theme from "@/constants/Theme";
import PerformanceCard from "@/components/cards/PerformanceCard";
import FilterButton from "@/components/filters/FilterButton";
import RegionFilterModal from "@/components/filters/RegionFilterModal";
import IcCalendarArrowLeft from "@/assets/icons/ic-calendar-arrow-left.svg";
import IcCalendarArrowRight from "@/assets/icons/ic-calendar-arrow-right.svg";

import { getWeekDayFromDateString } from "@/utils/dateUtils";

const MOCK_PERFORMANCES = [
  { id: "1", title: "어둠속 빛나는 광채 ‘DARK Radiance’", venue: { name: "코멘터리 사운드" }, date: "2025-09-14", region: "서울", posterUrl: "https://picsum.photos/100/100" },
  { id: "2", title: "어둠속 빛나는 광채 ‘DARK Radiance’", venue: { name: "코멘터리 사운드" }, date: "2025-09-14", region: "인천", posterUrl: "https://picsum.photos/100/100" },
  { id: "3", title: "aaa", venue: { name: "코멘터리 사운드" }, date: "2025-09-14", region: "제주", posterUrl: "https://picsum.photos/100/100" },
  { id: "4", title: "aaa", venue: { name: "코멘터리 사운드" }, date: "2025-09-14", region: "경기", posterUrl: "https://picsum.photos/100/100" },
  { id: "5", title: "aaa", venue: { name: "코멘터리 사운드" }, date: "2025-09-14", region: "서울", posterUrl: "https://picsum.photos/100/100" },
  { id: "6", title: "aaa", venue: { name: "코멘터리 사운드" }, date: "2025-09-14", region: "서울", posterUrl: "https://picsum.photos/100/100" },
  { id: "7", title: "bbb", venue: { name: "코멘터리 사운드" }, date: "2025-09-17", region: "서울", posterUrl: "https://picsum.photos/100/100" },
  { id: "8", title: "ccc", venue: { name: "코멘터리 사운드" }, date: "2025-09-18", region: "제주", posterUrl: "https://picsum.photos/100/100" },
  { id: "9", title: "ddd", venue: { name: "코멘터리 사운드" }, date: "2025-09-20", region: "인천", posterUrl: "https://picsum.photos/100/100" },
  { id: "10", title: "eee", venue: { name: "코멘터리 사운드" }, date: "2025-10-20", region: "서울", posterUrl: "https://picsum.photos/100/100" },
];

export default function TabCalendarScreen() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [regions, setRegions] = useState<string[]>(["전체"]);
  const [regionVisible, setRegionVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarRef = useRef<any>(null);
  const icChevronSize = Theme.iconSizes.xs;

  const performancesForDate = MOCK_PERFORMANCES.filter(
    (p) => p.date === selectedDate && (regions.includes("전체") || regions.includes(p.region))
  );

  const getRegionLabel = () => {
    if (regions.includes("전체") || regions.length === 0) return "지역: 전체";
    if (regions.length <= 2) return `지역: ${regions.join(", ")}`;
    return `지역: ${regions.slice(0, 2).join(", ")} 외 ${regions.length - 2}곳`;
  };

  // 공연 있는 날짜 표시
  const performanceDates = MOCK_PERFORMANCES.map((p) => p.date);
  const markedDates = performanceDates.reduce((acc, date) => {
    acc[date] = {
      customStyles: {
        container: {
          borderWidth: 1,
          borderColor: Theme.colors.themeOrange,
          borderRadius: 20,
        },
        text: {
          color: Theme.colors.black,
        },
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
        },
        text: {
          color: Theme.colors.white,
        },
      },
    };
  }

  // 오늘 날짜 점 표시
  if (today === selectedDate) {
    // 오늘 선택됨 → 회색 점 표시
    markedDates[today] = {
      ...(markedDates[today] || {}),
      customStyles: {
        container: {
          backgroundColor: Theme.colors.themeOrange,
          borderRadius: 20,
        },
        text: {
          color: Theme.colors.white,
        },
      },
      marked: true,
      dotColor: Theme.colors.white, // 회색 점
    };
  } else {
    // 오늘 선택되지 않음 → 주황 점
    markedDates[today] = {
      ...(markedDates[today] || {}),
      marked: true,
      dotColor: Theme.colors.themeOrange,
    };
  }

  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(prevMonth);
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(nextMonth);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>

        <View style={styles.monthWrapper}>
          <TouchableOpacity onPress={goToPreviousMonth} style={{marginRight: Theme.spacing.sm}} >
            <IcCalendarArrowLeft width={icChevronSize} height={icChevronSize} />
          </TouchableOpacity>

          <Text style={styles.monthText}>{currentDate.getMonth()+1}월</Text>

          <TouchableOpacity onPress={goToNextMonth} style={{marginLeft: Theme.spacing.sm}} >
            <IcCalendarArrowRight width={icChevronSize} height={icChevronSize} />
          </TouchableOpacity>
        </View>

        {/* 오른쪽 영역 - 맞춰주려고 더미 뷰 */}
        <FilterButton label={getRegionLabel()} onPress={() => setRegionVisible(true)} /> 
      </View>


      {/* 캘린더 */}
      <CalendarList
        ref={calendarRef}
        horizontal
        pagingEnabled
        hideArrows={true}
        renderHeader={() => null}
        calendarWidth={Dimensions.get("window").width}
        style={{ height: 320 }}
        current={currentDate.toISOString().split("T")[0]}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        markingType="custom"
        onVisibleMonthsChange={(months) => setCurrentDate(new Date(months[0].timestamp))}
        dayNamesShort={["일","월","화","수","목","금","토"]}
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

      {/* 선택한 날짜 표시 */}
      <Text style={styles.dateText}>
        {new Date(selectedDate).toLocaleDateString("ko-KR", {
          month: "long",
          day: "numeric",
        })} {getWeekDayFromDateString(selectedDate)} 공연
      </Text>

      {/* 공연 카드 목록 */}
      <FlatList
        data={performancesForDate}
        keyExtractor={(item) => item.id}
        numColumns={3} // 항상 3등분
        contentContainerStyle={styles.cardList}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <PerformanceCard
              type="calendar"
              title={item.title}
              venue={item.venue.name}
              posterUrl={item.posterUrl}
              onPress={() => router.push(`/performance/${item.id}`)}
            />
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>선택한 날짜에 공연이 없습니다</Text>
        }
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
  container: { 
    flex: 1, 
    backgroundColor: Theme.colors.white 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", 
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
  },
  monthWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  monthText: {
    fontSize: Theme.fontSizes.lg,
    fontWeight: Theme.fontWeights.semibold,
    color: Theme.colors.black,
  },
  dateText: {
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.semibold,
    padding: Theme.spacing.md,
  },
  cardList: {
    paddingHorizontal: Theme.spacing.sm,
    backgroundColor: Theme.colors.white,
  },
  cardWrapper: {
    width: `${100 / 3}%`,
    padding: Theme.spacing.xs,
  },
  emptyText: {
    textAlign: "center",
    marginTop: Theme.spacing.lg,
    color: Theme.colors.gray,
  },
});
