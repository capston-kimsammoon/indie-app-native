// app/mystamp/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

type Stamp = {
  id: number;
  title: string;
  venue: string;
  date: string;     
  posterUrl: string;
};

const INITIAL_STAMPS: Stamp[] = [
  {
    id: 1,
    title: "A Place Called Sound",
    venue: "코멘터리 사운드",
    date: "2025.05.06 화요일",
    posterUrl:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=640",
  },
  {
    id: 2,
    title: "Midnight Jazz Session",
    venue: "언플러그드 홍대",
    date: "2025.05.12 월요일",
    posterUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=640",
  },
  {
    id: 3,
    title: "Indie Night Vol.3",
    venue: "CLUB FF",
    date: "2025.05.20 화요일",
    posterUrl:
      "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?w=640",
  },
  {
    id: 4,
    title: "City Pop Live",
    venue: "프리즘홀",
    date: "2025.06.01 일요일",
    posterUrl:
      "https://images.unsplash.com/photo-1497032205916-ac775f0649ae?w=640",
  },
  {
    id: 5,
    title: "Summer Rock Fest",
    venue: "롤링홀",
    date: "2025.06.15 일요일",
    posterUrl:
      "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=640",
  },
  {
    id: 6,
    title: "Acoustic Morning",
    venue: "브이홀",
    date: "2025.06.22 일요일",
    posterUrl:
      "https://images.unsplash.com/photo-1520975979642-6453be3f7070?w=640",
  },
];


export default function MyStampScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ search?: string }>();

  const [stamps] = useState<Stamp[]>(INITIAL_STAMPS);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (params?.search) setSearchOpen(true);
  }, [params?.search]);

  const data = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return stamps;
    return stamps.filter(
      (s) =>
        s.title.toLowerCase().includes(key) ||
        s.venue.toLowerCase().includes(key) ||
        s.date.toLowerCase().includes(key)
    );
  }, [q, stamps]);

  const clearSearch = () => {
    setQ("");
    setSearchOpen(false);
    router.setParams({ search: undefined as any });
  };

  const ListHeader = () => (
    <View style={styles.countRow}>
      <Text style={styles.countText}>
        All <Text style={styles.countNum}>{data.length}</Text>
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      {searchOpen && (
        <View style={styles.searchBarWrap}>
          <Ionicons name="search" size={18} color="#888" />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="공연/장소/날짜 검색"
            placeholderTextColor="#aaa"
            style={styles.searchInput}
            returnKeyType="search"
            autoFocus
          />
          {q.length > 0 ? (
            <Pressable onPress={() => setQ("")} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color="#bbb" />
            </Pressable>
          ) : (
            <Pressable onPress={clearSearch} hitSlop={10}>
              <Ionicons name="close" size={18} color="#bbb" />
            </Pressable>
          )}
        </View>
      )}

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.posterUrl }} style={styles.poster} />
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.venue} numberOfLines={1}>
                {item.venue}
              </Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  searchBarWrap: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e5e5",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 2,
    fontSize: 14,
    color: "#111",
  },

  countRow: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8 },
  countText: { color: "#6b7280", fontSize: 13 },
  countNum: { color: "#16a34a", fontWeight: "700" },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  poster: {
    width: 60,
    height: 80,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
  },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700", color: "#111" },
  venue: { fontSize: 13, color: "#374151", marginTop: 2 },
  date: { fontSize: 13, color: "#6b7280", marginTop: 4 },
});
