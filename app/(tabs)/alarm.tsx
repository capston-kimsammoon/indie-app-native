// app/(tabs)/alarm.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import Theme from "@/constants/Theme";
import { formatRelativeTime, calcDDay } from "@/utils/dateUtils";
import { useRouter } from "expo-router";
import IcClose from "@/assets/icons/ic-close.svg";
/*
공연 예매 알림(티켓 오픈 하루 전, 30분 전) 
title: 티켓 오픈 D-{calcDDay(공연아이디.티켓오픈날짜)} 
content: {공연아이디.공연이름} 티켓이 내일 ㅇㅇ시에 오픈됩니다. 
title: 티켓 오픈 ㅇ분 전 
content: {공연아이디.공연이름} 티켓이 잠시후 오픈됩니다. 
공연 찜(공연 하루 전) 
title: 
content: 
아티스트 공연 알림(새로운 공연 뜨면 바로) 
title: 새로운 공연이 등록되었습니다. 
content: {아티스트.이름}이 {공연.이름} 공연에 나옵니다? 
아티스트 찜() 
title: 
content: 
리뷰 좋아요(내가 쓴 리뷰에 좋아요 달리면 바로) 
title: 
content:
*/

type NotificationType =
  | "ticket_open" // 공연 예매 알림
  | "performance_like" // 공연 찜
  | "artist_performance" // 아티스트 공연 알림
  | "artist_like" // 아티스트 찜
  | "review_like"; // 리뷰 좋아요

interface Notification {
  id: string;
  type: NotificationType;
  performanceId?: string;
  artistId?: string;
  reviewId?: string;
  date: string;
}

const resources = {
  performances: {
    p1: {
      id: "p1",
      title: "NCT 127 단독 콘서트",
      ticketOpenDate: "2025-09-19T20:00:00.000Z", // 티켓 오픈 시간
      ticketOpenTime: "오후 8시",
      minutesLeft: 30,
    },
    p2: {
      id: "p2",
      title: "스탠딩 에그 전국 투어",
    },
  },
  artists: {
    a1: { id: "a1", name: "아이유" },
    a2: { id: "a2", name: "김삼문" },
  },
  reviews: {
    r1: { id: "r1", excerpt: "최고의 공연이었어요!" },
  },
};


function buildNotificationMessage(n: Notification) {
  switch (n.type) {
    case "ticket_open": {
      const perf = resources.performances[n.performanceId!];
      const dday = calcDDay(perf.ticketOpenDate);
      if (dday === 1) {
        return {
          title: `티켓 오픈 D-${dday}`,
          content: `${perf.title} 티켓이 내일 ${perf.ticketOpenTime}에 오픈됩니다.`,
        };
      } else {
        return {
          title: `티켓 오픈 ${perf.minutesLeft}분 전`,
          content: `${perf.title} 티켓이 잠시 후 오픈됩니다.`,
        };
      }
    }
    case "performance_like": {
      const perf = resources.performances[n.performanceId!];
      return {
        title: "관심 공연 알림",
        content: `${perf.title} 공연이 내일 열립니다.`,
      };
    }
    case "artist_performance": {
      const perf = resources.performances[n.performanceId!];
      const artist = resources.artists[n.artistId!];
      return {
        title: "새로운 공연이 등록되었습니다.",
        content: `${artist.name}이(가) ${perf.title} 공연에 출연합니다.`,
      };
    }
    case "artist_like": {
      const artist = resources.artists[n.artistId!];
      return {
        title: "관심 아티스트 알림",
        content: `${artist.name}의 새로운 소식이 도착했습니다.`,
      };
    }
    case "review_like": {
      const review = resources.reviews[n.reviewId!];
      return {
        title: "내 리뷰에 좋아요가 달렸습니다.",
        content: `"${review.excerpt}" 리뷰에 새로운 좋아요가 있습니다.`,
      };
    }
    default:
      return { title: "", content: "" };
  }
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "ticket_open", performanceId: "p1", date: "2025-09-18T09:40:36.000Z" },
  { id: "2", type: "performance_like", performanceId: "p2", date: "2025-09-18T09:37:36.000Z" },
  { id: "3", type: "artist_performance", artistId: "a2", performanceId: "p2", date: "2025-09-17T23:20:00.000Z" },
  { id: "4", type: "artist_like", artistId: "a1", date: "2025-09-17T03:00:00.000Z" },
  { id: "5", type: "review_like", reviewId: "r1", date: "2025-09-16T11:00:00.000Z" },
];

const NotificationItem = ({ item, onPress, onDelete }) => {
  const { title, content } = buildNotificationMessage(item);
  return (
    <TouchableOpacity style={styles.itemContainer} onPress={() => onPress(item)}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemContent}>{content}</Text>
        <Text style={styles.itemDate}>{formatRelativeTime(item.date)}</Text>
      </View>
      <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.closeBtn}>
        <IcClose width={Theme.iconSizes.sm} height={Theme.iconSizes.sm} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function AlarmScreen() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const router = useRouter();

  const handlePress = (item: Notification) => {
    if (item.type === "ticket_open" || item.type === "performance_like" || item.type === "artist_performance") {
      router.push(`/performance/${item.performanceId}`);
    } else if (item.type === "artist_like") {
      router.push(`/artist/${item.artistId}`);
    } else if (item.type === "review_like") {
      router.push(`/review/${item.reviewId}`);
    }
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };


  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem item={item} onPress={handlePress} onDelete={handleDelete} />
        )}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: Theme.colors.lightGray,
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  itemTitle: {
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.bold,
    marginBottom: Theme.spacing.xs,
  },
  itemContent: {
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.black,
    marginBottom: Theme.spacing.xs,
  },
  itemDate: {
    fontSize: Theme.fontSizes.xs,
    color: Theme.colors.gray,
    marginTop: Theme.spacing.xs,
  },
  closeBtn: {
    marginLeft: Theme.spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: Theme.colors.lightGray,
    marginLeft: Theme.spacing.sm,
  },
});
