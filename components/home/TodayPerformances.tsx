// components/home/TodayPerformances.tsx
// 배너 첫 장에서 왼쪽으로 이동하면 마지막 장, 마지막 장에서 오른쪽으로 이동하면 첫 장 되어야 함 
// 배너 첫 장, 마지막 장에서 좌우 화살표 클릭 시 애니메이션 방향 올바르게 처리해야 함
// components/home/TodayPerformances.tsx
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Dimensions } from "react-native";
import { useRef, useState } from "react";
import Theme from "@/constants/Theme";
import IcChevronLeft from "@/assets/icons/ic-chevron-left.svg";
import IcChevronRight from "@/assets/icons/ic-chevron-right.svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = Theme.spacing.md * 2;
const BANNER_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING;
const BANNER_HEIGHT = 200;

const TODAY_ITEMS = [
  { id: "1", title: "오늘 공연 1", venue: "홍대 클럽", date: "2025.09.12", posterUrl: require("../../assets/images/sample-poster1.jpeg") },
  { id: "2", title: "오늘 공연 2", venue: "강남 공연장", date: "2025.09.12", posterUrl: require("../../assets/images/sample-poster1.jpeg") },
  { id: "3", title: "오늘 공연 3", venue: "이태원 공연장", date: "2025.09.12", posterUrl: require("../../assets/images/sample-poster1.jpeg") },
];

export default function TodayPerformances() {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollToIndex = (index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
      setCurrentIndex(index);
    }
  };

  const onScroll = (e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
    if (newIndex !== currentIndex) setCurrentIndex(newIndex);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.title}>9월 12일 공연</Text>

      <View style={styles.carouselWrapper}>
        <FlatList
          ref={flatListRef}
          data={TODAY_ITEMS}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.posterWrapper}>
                <Image source={item.posterUrl} style={styles.poster} resizeMode="cover" />
              </View>
              <View style={styles.info}>
                <Text style={styles.performanceTitle}>{item.title}</Text>
                <Text style={styles.venue}>{item.venue}</Text>
                <Text style={styles.date}>{item.date}</Text>
              </View>
            </View>
          )}
          horizontal
          pagingEnabled
          snapToInterval={BANNER_WIDTH + Theme.spacing.xs * 2}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        />

        {/* 왼쪽 화살표 */}
        <TouchableOpacity
          style={[styles.iconButton, { left: 0 }]}
          onPress={() => scrollToIndex(currentIndex === 0 ? TODAY_ITEMS.length - 1 : currentIndex - 1)}
        >
          <IcChevronLeft width={Theme.iconSizes.lg} height={Theme.iconSizes.lg} />
        </TouchableOpacity>

        {/* 오른쪽 화살표 */}
        <TouchableOpacity
          style={[styles.iconButton, { right: 0 }]}
          onPress={() => scrollToIndex(currentIndex === TODAY_ITEMS.length - 1 ? 0 : currentIndex + 1)}
        >
          <IcChevronRight width={Theme.iconSizes.lg} height={Theme.iconSizes.lg} />
        </TouchableOpacity>

        {/* 인디케이터 */}
        <View style={styles.indicator}>
          {TODAY_ITEMS.map((_, i) => (
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
    paddingVertical: Theme.spacing.sm,
  },
  carouselWrapper: {
    position: "relative",
    alignItems: "center",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
  },
  card: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md + Theme.iconSizes.lg,
    flexDirection: "row",
    backgroundColor: Theme.colors.white,
    borderRadius: 8,
    overflow: "hidden",
  },
  posterWrapper: {
    height: "100%",
    justifyContent: "center",
    aspectRatio: 3 / 4,
  },
  poster: {
    height: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    justifyContent: "center",
    marginLeft: Theme.spacing.md,
  },
  performanceTitle: {
    fontSize: Theme.fontSizes.lg,
    fontWeight: Theme.fontWeights.semibold,
    color: Theme.colors.black,
    paddingVertical: Theme.spacing.xs,
  },
  venue: {
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.black,
    paddingVertical: Theme.spacing.xs,
  },
  date: {
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.darkGray,
    paddingVertical: Theme.spacing.xs,
  },
  iconButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -12 }],
    backgroundColor: "transparent", 
    marginHorizontal: Theme.spacing.sm,
    zIndex: 10,
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
