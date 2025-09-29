// components/home/TodayPerformances.tsx
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native";
import { useRef, useState, useEffect } from "react";
import Theme from "@/constants/Theme";
import IcChevronLeft from "@/assets/icons/ic-chevron-left.svg";
import IcChevronRight from "@/assets/icons/ic-chevron-right.svg";

import { getToday, getDateFromDateString, getWeekDayFromDateString } from "@/utils/dateUtils";
import { fetchTodayPerformances } from "@/api/PerformanceApi";
import { Performance } from "@/types/performance";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = Theme.spacing.md * 2;
const BANNER_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING;
const BANNER_HEIGHT = 160;

// 실제 데이터
const TODAY_ITEMS = [
  { id: "1", title: "ROCK N’ROLL BABY11", venue: "스팀펑크락", date: "2025-09-12", posterUrl: "https://picsum.photos/400/200" },
  { id: "2", title: "오늘 공연 2", venue: "강남 공연장", date: "2025-09-12", posterUrl: "https://picsum.photos/400/200" },
  { id: "3", title: "오늘 공연 3", venue: "이태원 공연장", date: "2025-09-12", posterUrl: "https://picsum.photos/400/200" },
  { id: "4", title: "오늘 공연 4", venue: "신촌 공연장", date: "2025-09-12", posterUrl: "https://picsum.photos/400/200" },
];

// 무한 루프용 복제 데이터
const LOOPED_ITEMS = [
  TODAY_ITEMS[TODAY_ITEMS.length - 1], // 마지막 카드
  ...TODAY_ITEMS,
  TODAY_ITEMS[0], // 첫 카드
];

export default function TodayPerformances() {
  const flatListRef = useRef<FlatList>(null);
  const [items, setItems] = useState<Performance[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const IcChevronSize = Theme.iconSizes.md;

  // API 호출
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchTodayPerformances();
      setItems(data);
      setLoading(false);

      // FlatList loop용 첫 위치 보정
      if (data.length > 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: 1, animated: false });
        }, 0);
      }
    };
    load();
  }, []);

  // loop 데이터
  const loopedItems =
    items.length > 0
      ? [items[items.length - 1], ...items, items[0]]
      : [];

  // 스크롤 끝났을 때 보정
  const onMomentumScrollEnd = (e: any) => {
    const offset = e.nativeEvent.contentOffset.x;
    const index = Math.round(offset / BANNER_WIDTH);

    if (index === 0) {
      flatListRef.current?.scrollToIndex({ index: items.length, animated: false });
      setCurrentIndex(items.length - 1);
    } else if (index === loopedItems.length - 1) {
      flatListRef.current?.scrollToIndex({ index: 1, animated: false });
      setCurrentIndex(0);
    } else {
      setCurrentIndex(index - 1);
    }
  };

  // 버튼 클릭 시 한 칸 이동
  const goToPrev = () => {
    if (items.length === 0) return;
    let newIndex = currentIndex - 1;
    if (newIndex < 0) newIndex = items.length - 1;
    flatListRef.current?.scrollToIndex({ index: newIndex + 1, animated: true });
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    if (items.length === 0) return;
    let newIndex = currentIndex + 1;
    if (newIndex >= items.length) newIndex = 0;
    flatListRef.current?.scrollToIndex({ index: newIndex + 1, animated: true });
    setCurrentIndex(newIndex);
  };

  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.title}>{getToday()} 공연</Text>
        <ActivityIndicator size="large" color={Theme.colors.themeOrange} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.title}>{getToday()} 공연</Text>
        <Text style={{ color: Theme.colors.gray }}>오늘 예정된 공연이 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{getToday()} 공연</Text>

      <View style={styles.carouselWrapper}>
        <FlatList
          ref={flatListRef}
          data={loopedItems}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.thumbnail }} style={styles.poster} resizeMode="cover" />
              <View style={styles.info}>
                <Text style={styles.performanceTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.venue}>{item.venue}</Text>
                <Text style={styles.date}>
                  {getDateFromDateString(item.date)} {getWeekDayFromDateString(item.date)}
                </Text>
              </View>
            </View>
          )}
          keyExtractor={(_, i) => i.toString()}
          horizontal
          pagingEnabled
          snapToInterval={BANNER_WIDTH}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={1}
          getItemLayout={(_, index) => ({
            length: BANNER_WIDTH,
            offset: BANNER_WIDTH * index,
            index,
          })}
          onMomentumScrollEnd={onMomentumScrollEnd}
        />

        {/* 좌우 버튼 */}
        <TouchableOpacity style={[styles.iconLeftButton, { left: 0 }]} onPress={goToPrev}>
          <IcChevronLeft width={IcChevronSize} height={IcChevronSize} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconRightButton, { right: 0 }]} onPress={goToNext}>
          <IcChevronRight width={IcChevronSize} height={IcChevronSize} />
        </TouchableOpacity>

        {/* 인디케이터 */}
        <View style={styles.indicator}>
          {items.map((_, i) => (
            <View key={i} style={[styles.line, currentIndex === i && styles.activeLine]} />
          ))}
        </View>
      </View>
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
    paddingVertical: Theme.spacing.md,
  },
  carouselWrapper: {
    position: "relative",
    alignItems: "center",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    padding: Theme.spacing.md,
  },
  card: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    flexDirection: "row",
    backgroundColor: Theme.colors.white,
    borderRadius: 8,
    overflow: "hidden",
  },
  poster: {
    height: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 8,
  },
  info: {
    justifyContent: "center",
    marginLeft: Theme.spacing.lg,
  },
  performanceTitle: {
    fontSize: Theme.fontSizes.lg,
    fontWeight: Theme.fontWeights.semibold,
    color: Theme.colors.black,
    marginBottom: Theme.spacing.md,
    flexWrap: "wrap",
  },
  venue: {
    fontSize: Theme.fontSizes.sm,
    fontWeight: Theme.fontWeights.regular,
    color: Theme.colors.black,
    marginBottom: Theme.spacing.sm,
  },
  date: {
    fontSize: Theme.fontSizes.sm,
    fontWeight: Theme.fontWeights.regular,
    color: Theme.colors.darkGray,
  },
  iconLeftButton: {
    position: "absolute",
    top: "50%",
    backgroundColor: "transparent",
    marginHorizontal: Theme.spacing.md,
  },
  iconRightButton: {
    position: "absolute",
    top: "50%",
    backgroundColor: "transparent",
    marginHorizontal: Theme.spacing.md,
  },
  indicator: {
    position: "absolute",
    bottom: Theme.spacing.sm,
    left: "50%",
    flexDirection: "row",
    justifyContent: "space-between",
    width: 100,
    transform: [{ translateX: -50 }],
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: Theme.colors.lightGray,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  activeLine: {
    backgroundColor: Theme.colors.themeOrange,
  },
});
