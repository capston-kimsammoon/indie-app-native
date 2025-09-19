// 5. 티켓 오픈 예정
// components/home/UpcomingTickets.tsx
import { View, Text, StyleSheet, FlatList } from "react-native";
import Theme from "@/constants/Theme";
import PerformanceCard from "@/components/cards/PerformanceCard";

const UPCOMING_TICKETS = [
  { id: "1", title: "오늘 공연 1", venue: "홍대 클럽", date: "2025.09.12", ticketOpenDate: "2025.05.28", ticketOpenTime: "오후 8시", posterUrl: "https://picsum.photos/90/120" },
  { id: "2", title: "오늘 공연 2", venue: "강남 공연장", date: "2025.09.12", posterUrl: "https://picsum.photos/90/120" },
  { id: "3", title: "오늘 공연 3", venue: "이태원 공연장", date: "2025.09.12", posterUrl: "https://picsum.photos/90/120" },
];

export default function UpcomingTickets() {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>티켓 오픈 예정</Text>

      <FlatList
        data={UPCOMING_TICKETS}
        renderItem={({ item }) => (
          <PerformanceCard
            type="upcomingTicket"
            title={item.title}
            venue={item.venue}
            date={item.date}
            ticketOpenDate={item.ticketOpenDate}
            ticketOpenTime={item.ticketOpenTime}
            posterUrl={item.posterUrl}
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
  list: {
    paddingRight: Theme.spacing.md,
  },
});
