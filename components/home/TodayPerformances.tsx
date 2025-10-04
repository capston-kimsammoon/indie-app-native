// components/home/TodayPerformances.tsx
import { View, Text, StyleSheet, Image, FlatList, Dimensions, ActivityIndicator, Pressable } from "react-native";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "expo-router";

import Theme from "@/constants/Theme";

import { getToday, getDateFromDateString, getWeekDayFromDateString } from "@/utils/dateUtils";
import { fetchTodayPerformances } from "@/api/PerformanceApi";
import { Performance } from "@/types/performance";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = Theme.spacing.md * 2;
const BANNER_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING; // wrapper 안에서 딱 맞게
const BANNER_HEIGHT = 160;

export default function TodayPerformances() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [items, setItems] = useState<Performance[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const IcChevronSize = Theme.iconSizes.md;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchTodayPerformances();
      setItems(data);
      setLoading(false);

      if (data.length > 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: 1, animated: false });
        }, 0);
      }
    };
    load();
  }, []);

  const loopedItems = items.length > 0 ? [items[items.length - 1], ...items, items[0]] : [];

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
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={BANNER_WIDTH}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 0 }}
          initialScrollIndex={1}
          keyExtractor={(_, index) => `today-performance-${index}`}
          getItemLayout={(_, index) => ({
            length: BANNER_WIDTH,
            offset: BANNER_WIDTH * index,
            index,
          })}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/performance/${item.id}`)}>
              <View style={[styles.card, { width: BANNER_WIDTH }]}>
                <Image source={item.thumbnail ? { uri: item.thumbnail } : require('@/assets/images/modie-sample.png')} style={styles.poster} resizeMode="cover" />
                <View style={styles.info}>
                  <Text style={styles.performanceTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
                  <Text style={styles.venue} numberOfLines={1} ellipsizeMode="tail">{item.venue}</Text>
                  <Text style={styles.date}>
                    {getDateFromDateString(item.date)} {getWeekDayFromDateString(item.date)}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
          onMomentumScrollEnd={onMomentumScrollEnd}
        />

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
    paddingBottom: Theme.spacing.md,
  },
  carouselWrapper: {
    position: "relative",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    padding: Theme.spacing.md,
    overflow: "hidden",
  },
  card: {
    height: BANNER_HEIGHT,
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
  },
  poster: {
    height: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
  },
  info: {
    justifyContent: "center",
    marginLeft: Theme.spacing.md,
    marginRight: Theme.spacing.md,
    flex: 1,
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
    fontWeight: Theme.fontWeights.semibold,
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
