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
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchCollectedStamps } from "@/api/stampApi";
import Theme from "@/constants/Theme";
type StampRow = {
  id: number;
  title: string;
  venue: string;
  date: string;
  posterUrl?: string;
};

function toYmd(dateLike?: string | number | Date) {
  if (!dateLike) return "-";
  const d = new Date(dateLike);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export default function MyStampScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ search?: string }>();

  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  const [rows, setRows] = useState<StampRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.search) setSearchOpen(true);
  }, [params?.search]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchCollectedStamps();
        const mapped: StampRow[] = (data || []).map((s: any) => ({
          id: s.id,
          title: s?.performance?.title ?? "-",
          venue: s?.performance?.venue?.name ?? "-",
          date: toYmd(s?.performance?.date),
          posterUrl: s?.performance?.image_url ?? undefined,
        }));
        setRows(mapped);
      } catch (e: any) {
        console.error(e);
        Alert.alert("오류", e?.message ?? "스탬프 목록을 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const data = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return rows;
    return rows.filter(
      (s) =>
        s.title.toLowerCase().includes(key) ||
        s.venue.toLowerCase().includes(key) ||
        s.date.toLowerCase().includes(key)
    );
  }, [q, rows]);

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
          <Ionicons name="search" size={Theme.iconSizes.sm} color={Theme.colors.lightGray} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="공연/장소/날짜 검색"
            placeholderTextColor={Theme.colors.lightGray}
            style={styles.searchInput}
            returnKeyType="search"
            autoFocus
          />
          {q.length > 0 ? (
            <Pressable onPress={() => setQ("")} hitSlop={10}>
              <Ionicons name="close-circle" size={Theme.iconSizes.sm} color={Theme.colors.lightGray} />
            </Pressable>
          ) : (
            <Pressable onPress={clearSearch} hitSlop={10}>
              <Ionicons name="close" size={Theme.iconSizes.sm} color={Theme.colors.lightGray} />
            </Pressable>
          )}
        </View>
      )}

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={ListHeader}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image
                source={{
                  uri:
                    item.posterUrl ||
                    "https://dummyimage.com/120x160/eeeeee/aaaaaa&text=NO+IMAGE",
                }}
                style={styles.poster}
              />
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
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Text style={{ color: Theme.colors.lightGray }}>수집한 스탬프가 없어요</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.white },

  searchBarWrap: {
    marginHorizontal: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.lightGray,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.sm,
    gap: Theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.white,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 2,
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.black,
  },

  countRow: { paddingHorizontal: Theme.spacing.md, paddingTop: Theme.spacing.sm, paddingBottom: Theme.spacing.sm },
  countText: { color: Theme.colors.darkGray, fontSize: Theme.fontSizes.sm },
  countNum: { color: Theme.colors.themeOrange, fontWeight: Theme.fontWeights.bold },

  listContent: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.xs,
    paddingBottom: Theme.spacing.lg,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    borderRadius: 12,
    backgroundColor: Theme.colors.white,
    padding: Theme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.white,
    shadowColor: Theme.colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  poster: {
    width: 60,
    height: 80,
    borderRadius: 6,
    backgroundColor: Theme.colors.white,
  },
  info: { flex: 1 },
  title: { fontSize: Theme.fontSizes.base, fontWeight: Theme.fontWeights.bold, color: Theme.colors.black },
  venue: { fontSize: Theme.fontSizes.sm, color: Theme.colors.darkGray, marginTop: Theme.spacing.xs },
  date: { fontSize: Theme.fontSizes.sm, color: Theme.colors.gray, marginTop: Theme.spacing.xs },
});
