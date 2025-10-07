// components/cards/PerformanceCard.tsx
import { View, Text, Image, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import Theme from "@/constants/Theme";

import IcHeartOutline from "@/assets/icons/ic-heart-outline.svg";
import IcHeartFilled from "@/assets/icons/ic-heart-filled.svg";

type PerformanceCardProps = {
  title: string;
  venue?: string;
  date?: string;
  time?: string;
  ticketOpenDate?: string;
  ticketOpenTime?: string;
  userName?: string;
  posterUrl: string;
  content?: string;
  type?:
    | "today"
    | "popular"
    | "new"
    | "upcomingTicket"
    | "mood"
    | "list"
    | "venuePast"
    | "wish"
    | "history"
    | "calendar"
    | "location";
  showHeart?: boolean;
  liked?: boolean;
  onPress?: () => void;
  onToggleLike: () => void;
  selected?: boolean;
};

export default function PerformanceCard({
  title,
  venue,
  date,
  ticketOpenDate,
  ticketOpenTime,
  posterUrl,
  type = "popular",
  showHeart = false,
  liked,
  onPress,
  onToggleLike,
  selected,
}: PerformanceCardProps) {
  const isHorizontal = type === "today" || type === "venuePast";
  const isUpcomingTicket = type === "upcomingTicket";
  const isVertical = type === "popular" || type === "new" || type === "mood" || type === "history" || type === "location";
  const isList = type === "list";
  const isCalendar = type === "calendar";

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        styles.card,
        isHorizontal && styles.horizontalCard,
        isVertical && styles.verticalCard,
        isUpcomingTicket && styles.ticketCard,
        isCalendar && styles.calendarCard,
        type === "list" && styles.listCard,
        selected && { backgroundColor: Theme.colors.themeOrange + "20" }
      ]}
    >
      <Image
        source={ posterUrl ? {uri: posterUrl} : require('@/assets/images/modie-sample.png') }
        style={[
          styles.poster,
          isHorizontal && styles.posterHorizontal,
          isVertical && styles.posterVertical,
          isUpcomingTicket && styles.posterUpcoming,
          type === "list" && styles.posterList,
          isCalendar && styles.posterCalendar,
        ]}
        resizeMode="cover"
      />

      <View
        style={[
          styles.info,
          isVertical && styles.infoVertical,
          isUpcomingTicket && styles.infoUpcomingTicket,
          isList && styles.infoList,
          showHeart && styles.infoWithHeart,
        ]}
      >
        {isUpcomingTicket ? (
          <>
            {/* 위쪽: 제목 + 장소 */}
            <View style={styles.ticketTop}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              {venue && (
                <Text style={[styles.venue, styles.venueTicket]} numberOfLines={1}>
                  {venue}
                </Text>
              )}
            </View>

            {/* 아래쪽: 예매 오픈 */}
            {(ticketOpenDate || ticketOpenTime) && (
              <View style={styles.ticketBottom}>
                <View style={styles.ticketTagWrapper}>
                  <Text style={styles.ticketTag}>예매오픈</Text>
                </View>
                <View style={styles.ticketOpenDateTime}>
                  {ticketOpenDate && (
                    <Text style={styles.ticketOpenDate}>{ticketOpenDate}</Text>
                  )}
                  {ticketOpenTime && (
                    <Text style={styles.ticketOpenTime}> {ticketOpenTime}</Text>
                  )}
                </View>
              </View>
            )}
          </>
        ) : (
          <>
            {title && (
              <Text style={[styles.title, isList && styles.titleList]} numberOfLines={1}>
                {title}
              </Text>
            )}

            {venue && !isVertical && (
              <Text style={[styles.venue, isCalendar && styles.venueCalendar, isList && styles.venueList]} numberOfLines={1}>
                {venue}
              </Text>
            )}

            {!isUpcomingTicket && date && (
              <Text style={[styles.date, isList && styles.dateList]}>{date}</Text>
            )}
          </>
        )}
      </View>

      {/* 하트 버튼 */}
      {showHeart && onToggleLike && (
        <Pressable style={[styles.rightButton, styles.heartButton]} onPress={onToggleLike}>
          {liked ? 
          <IcHeartFilled width={Theme.iconSizes.sm} height={Theme.iconSizes.sm} /> 
          : <IcHeartOutline width={Theme.iconSizes.sm} height={Theme.iconSizes.sm} stroke={Theme.colors.lightGray} />
          }
        </Pressable>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: Theme.colors.white,
    borderRadius: 8,
    padding: Theme.spacing.sm,
  },
  horizontalCard: {
    width: 200,
    flexDirection: "row",
    marginRight: Theme.spacing.sm,
  },
  verticalCard: {
    width: 120,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  ticketCard: {
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    marginRight: Theme.spacing.md,
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: Theme.spacing.md,
  },
  calendarCard: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  poster: {
    borderRadius: 8,
    width: 80,
    height: 100,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
  },
  posterHorizontal: {
    width: 100,
    height: 120,
  },
  posterVertical: {
    width: "100%",
    aspectRatio: 3 / 4,
    height: undefined,
    borderRadius: 8,
    marginBottom: Theme.spacing.sm,
  },
  posterUpcoming: {
    height: "100%",
  },
  posterList: {
    marginRight: Theme.spacing.md,
  },
  posterCalendar: {
    width: "100%",
    aspectRatio: 3 / 4,
    height: undefined,
    borderRadius: 8,
    marginBottom: Theme.spacing.sm,
  },
  info: {
    justifyContent: "center",
  },
  infoWithHeart: {
    paddingRight: 40,
  },
  infoVertical: {
    flexDirection: "column",
    marginLeft: 0,
  },
  infoUpcomingTicket: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  infoList: {
    flex: 1,
    justifyContent: "center",
  },
  titleList: {
    fontSize: Theme.fontSizes.lg,
    fontWeight: Theme.fontWeights.semibold,
    marginBottom: Theme.spacing.sm,
  },
  venueList: {
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.regular,
    color: Theme.colors.black,
    marginBottom: Theme.spacing.sm,
  },
  venueCalendar: {
    fontSize: Theme.fontSizes.xs,
    fontWeight: Theme.fontWeights.regular,
    color: Theme.colors.darkGray,
  },
  dateList: {
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.light,
    color: Theme.colors.gray,
  },
  title: {
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.semibold,
    marginBottom: Theme.spacing.xs,
  },
  venue: {
    fontSize: Theme.fontSizes.xs,
    fontWeight: Theme.fontWeights.regular,
    color: Theme.colors.black,
  },
  venueTicket: {
    fontSize: Theme.fontSizes.sm,
    fontWeight: Theme.fontWeights.regular,
    color: Theme.colors.black,
  },
  date: {
    fontSize: Theme.fontSizes.xs,
    color: Theme.colors.gray,
  },
  review: {
    fontSize: Theme.fontSizes.xs,
    color: Theme.colors.gray,
  },
  ticketTop: {
    flexDirection: "column",
    marginLeft: Theme.spacing.sm,
    padding: Theme.spacing.sm,
  },
  ticketBottom: {
    flexDirection: "column",
    marginLeft: Theme.spacing.sm,
    padding: Theme.spacing.sm,
  },
  ticketTagWrapper: {
    backgroundColor: Theme.colors.themeOrange,
    borderRadius: 3,
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: Theme.spacing.xs / 2,
    marginBottom: Theme.spacing.xs / 2,
    alignSelf: "flex-start",
  },
  ticketTag: {
    fontSize: Theme.fontSizes.xs,
    fontWeight: Theme.fontWeights.semibold,
    color: Theme.colors.white,
  },
  ticketOpenDateTime: {
    flexDirection: "row",
  },
  ticketOpenDate: {
    fontSize: Theme.fontSizes.xs,
    fontWeight: Theme.fontWeights.semibold,
    color: Theme.colors.themeOrange,
  },
  ticketOpenTime: {
    fontSize: Theme.fontSizes.xs,
    fontWeight: Theme.fontWeights.semibold,
    color: Theme.colors.themeOrange,
  },
  ticketContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },

  heartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  rightButton: {
    position: "absolute",
    right: Theme.spacing.sm,
    top: "50%",
    transform: [{ translateY: -12 }],
  },
  reviewPrevCard: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: Theme.spacing.sm,
  },
  reviewPerformanceTitle: {
    fontSize: Theme.fontSizes.sm,
    fontWeight: Theme.fontWeights.medium,
    color: Theme.colors.darkGray,
    marginVertical: Theme.spacing.xs,
  },
  reviewTitle: {
    fontSize: Theme.fontSizes.sm,
    fontWeight: Theme.fontWeights.medium,
    color: Theme.colors.black,
    marginVertical: Theme.spacing.xs / 2,
  },
  reviewContent: {
    fontSize: Theme.fontSizes.xs,
    fontWeight: Theme.fontWeights.medium,
    color: Theme.colors.darkGray,
    marginVertical: Theme.spacing.xs / 2,
  },
  reviewUserName: {
    fontSize: Theme.fontSizes.xs,
    fontWeight: Theme.fontWeights.regular,
    color: Theme.colors.darkGray,
    marginVertical: Theme.spacing.xs,
  },
  reviewIcon: {
    marginTop: Theme.spacing.sm,
  },
  
});

