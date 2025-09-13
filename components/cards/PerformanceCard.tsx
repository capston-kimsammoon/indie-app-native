// components/cards/PerformanceCard.tsx
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import Theme from "@/constants/Theme";

import IcHeartOutline from "@/assets/icons/ic-heart-outline.svg";
import IcHeartFilled from "@/assets/icons/ic-heart-filled.svg";
import IcStampOutline from "@/assets/icons/ic-stamp-outline.svg";
import IcStampFilled from "@/assets/icons/ic-stamp-filled.svg";

type PerformanceCardProps = {
  title: string;
  venue?: string;
  date?: string;
  time?: string;
  ticketOpenDate?: string;
  ticketOpenTime?: string;
  reviewTitle?: string;
  reviewContent?: string;
  userName?: string;
  posterUrl: string;
  reviewCount?: number;
  content?: string;
  type?:
    | "today"
    | "popular"
    | "new"
    | "upcomingTicket"
    | "pick"
    | "mood"
    | "review"
    | "list"
    | "venuePast"
    | "wish"
    | "stamp";
  showHeart?: boolean;
  showStamp?: boolean;
};

export default function PerformanceCard({
  title,
  venue,
  date,
  ticketOpenDate,
  ticketOpenTime,
  posterUrl,
  reviewCount,
  content,
  reviewTitle,
  reviewContent,
  userName,
  type = "popular",
  showHeart = false,
  showStamp = false,
}: PerformanceCardProps) {
  const isHorizontal =
    type === "today" || type === "venuePast";
  const isUpcomingTicket = type === "upcomingTicket";
  const isPick = type === "pick";
  const isVertical = type === "popular" || type === "new" || type === "mood";
  const isReview = type === "review";

  return (
    <View
      style={[
        styles.card,
        isHorizontal && styles.horizontalCard,
        isVertical && styles.verticalCard,
        isUpcomingTicket && styles.ticketCard,
        type === "list" && styles.listCard,
      ]}
    >
      <Image
        source={posterUrl}
        style={[
          styles.poster,
          isHorizontal && styles.posterHorizontal,
          isVertical && styles.posterVertical,
          type === "list" && styles.posterList,
          isPick && styles.posterPick,
        ]}
        resizeMode="cover"
      />

      <View
        style={[
          styles.info,
          isPick && styles.infoPick,
          isVertical && styles.infoVertical,
          isUpcomingTicket && styles.infoUpcomingTicket,
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
          {/*}
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>*/}

            {venue && (
              <Text style={styles.venue} numberOfLines={1}>
                {venue}
              </Text>
            )}

            {!isUpcomingTicket && date && (
              <Text style={styles.date}>{date}</Text>
            )}

            {reviewCount !== undefined && (
              <Text style={styles.review}>{reviewCount} 리뷰</Text>
            )}

            {isPick && title && content && (
              <View style={styles.pickTitleContent}>
                <Text style={styles.pickTitle} numberOfLines={2}>
                  {title}
                </Text>
                <Text style={styles.pickContent} numberOfLines={2}>
                  {content}
                </Text>
              </View>
            )}
          </>
        )}
        {/* 리뷰 타입 */}
        {isReview ? (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewPerformanceTitle} numberOfLines={1}>
              {title}
            </Text>
            {reviewTitle && (
              <Text style={styles.reviewTitle} numberOfLines={1}>
                {reviewTitle}
              </Text>
            )}
            {reviewContent && (
              <Text style={styles.reviewContent} numberOfLines={2}>
                {reviewContent}
              </Text>
            )}
            {userName && (
              <Text style={styles.reviewUserName}>{userName}</Text>
            )}
          </View>
        ) : (
          <View
            style={[
              styles.info,
              isPick && styles.infoPick,
              isVertical && styles.infoVertical,
              isUpcomingTicket && styles.infoUpcomingTicket,
            ]}
          >
          </View>
        )}
      </View>

      {/* 하트 버튼 */}
      {showHeart && (
        <TouchableOpacity style={styles.rightButton}>
          <IcHeartOutline width={24} height={24} />
        </TouchableOpacity>
      )}

      {/* 스탬프 버튼 */}
      {showStamp && (
        <TouchableOpacity style={styles.rightButton}>
          <IcStampOutline width={24} height={24} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: Theme.colors.white,
    borderRadius: 8,
    padding: Theme.spacing.sm,
    marginHorizontal: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  horizontalCard: {
    width: 200,
    flexDirection: "row",
    marginRight: Theme.spacing.sm,
  },
  verticalCard: {
    width: 140,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  ticketCard: {
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
  },
  listCard: {
    width: "100%",
    marginHorizontal: 0,
    paddingVertical: Theme.spacing.sm,
  },
  poster: {
    borderRadius: 8,
    width: 80,
    height: 100,
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
    marginBottom: Theme.spacing.md,
  },
  posterList: {
    width: 100,
    height: 120,
    marginRight: Theme.spacing.md,
  },
  posterPick: {
    marginRight: Theme.spacing.sm,
  },
  info: {
    flex: 1,
    justifyContent: "center",
    marginLeft: Theme.spacing.sm,
  },
  infoVertical: {
    flexDirection: "column",
    marginLeft: 0,
  },
  infoPick: {
    flex: 1, 
    flexDirection: "column",
    justifyContent: "space-between",
  },
  infoUpcomingTicket: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  title: {
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.semibold,
    marginBottom: 2,
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
  },
  ticketBottom: {
    flexDirection: "column",
    marginTop: Theme.spacing.sm,
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
  pickTitleContent: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  pickTitle: {
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.semibold,
    color: Theme.colors.black,
  },
  pickContent: {
    fontSize: Theme.fontSizes.sm,
    fontWeight: Theme.fontWeights.regular,
    color: Theme.colors.darkGray,
  },


  rightButton: {
    position: "absolute",
    right: Theme.spacing.sm,
    top: "50%",
    transform: [{ translateY: -12 }],
  },
  reviewCard: {
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

