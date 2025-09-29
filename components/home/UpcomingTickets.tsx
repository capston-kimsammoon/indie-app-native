// components/home/UpcomingTickets.tsx
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import Theme from "@/constants/Theme";
import PerformanceCard from "@/components/cards/PerformanceCard";
import { fetchTicketOpeningPerformances } from "@/api/PerformanceApi";
import { Performance } from "@/types/performance";

export default function UpcomingTickets() {
  const router = useRouter();
  const [performances, setPerformances] = useState<Performance[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const end = new Date();
    end.setDate(end.getDate() + 7);
    const endDate = end.toISOString().split("T")[0];

    fetchTicketOpeningPerformances(today, endDate)
      .then((res) => {
        const mapped = res.map((p) => ({
          id: p.id.toString(),
          title: p.title,
          venue: p.venue,
          posterUrl: p.thumbnail,
          date: p.date,
          ticketOpenDate: p.ticket_open_date,
          ticketOpenTime: p.time, // API의 time 필드가 티켓 오픈 시간
        }));
        setPerformances(mapped);
      })
      .catch((err) => console.error("티켓 오픈 공연 조회 실패:", err));
  }, []);

  if (performances.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.title}>티켓 오픈 예정</Text>
          <Text style={styles.content}>티켓 오픈이 예정된 공연이 없습니다.</Text>
        </View>
      );
    }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>티켓 오픈 예정</Text>

      <FlatList
        data={performances}
        renderItem={({ item }) => (
          <PerformanceCard
            type="upcomingTicket"
            title={item.title}
            venue={item.venue}
            date={item.date}
            ticketOpenDate={item.ticketOpenDate}
            ticketOpenTime={item.ticketOpenTime}
            posterUrl={item.posterUrl}
            onPress={() => router.push(`/performance/${item.id}`)}
          />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
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
    color: Theme.colors.black,
    paddingVertical: Theme.spacing.md,
    textAlign: "center",
  },
  content: {
    color: Theme.colors.gray,
    textAlign: "center",
  },
  list: {
    paddingRight: Theme.spacing.md,
  },
});
