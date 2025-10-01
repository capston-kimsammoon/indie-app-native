import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from "react-native";
import { Heart, HeartOff } from "lucide-react-native";
import Theme from "@/constants/Theme";
import dayjs from "dayjs";
import "dayjs/locale/ko";
dayjs.locale("ko");

import http from "../../api/http";
import baseUrl from "../../api/config";

const fixUrl = (u?: string | null) =>
  typeof u === "string" ? u.replace("http://localhost:8000", baseUrl) : null;

type PerfFav = {
  id: number;
  title: string;
  venue: string;
  date: string;
  image: string | null;
};
type ArtistFav = { id: number; name: string; avatar: string | null };

export default function FavoritePage() {
  const [selectedTab, setSelectedTab] = useState<"performance" | "artist">("performance");

  // 공연 찜
  const [perfFavs, setPerfFavs] = useState<PerfFav[]>([]);
  const [perfPage, setPerfPage] = useState(1);
  const [perfTotal, setPerfTotal] = useState(1);

  // 아티스트 찜
  const [artistFavs, setArtistFavs] = useState<ArtistFav[]>([]);
  const [artistPage, setArtistPage] = useState(1);
  const [artistTotal, setArtistTotal] = useState(1);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pending, setPending] = useState<Set<string>>(new Set());

  // 공연 불러오기
  const loadPerformances = async (p: number, replace = false) => {
    if (loading || p > perfTotal) return;
    setLoading(true);
    try {
      const { data } = await http.get("/user/me/like/performance", {
        params: { page: p, size: 20 },
      });
      const mapped: PerfFav[] = (data?.performances ?? []).map((x: any) => ({
        id: x.id,
        title: x.title,
        venue: x.venue,
        date: x.date, // 포맷은 렌더에서 처리
        image: fixUrl(x.image_url),
      }));
      setPerfFavs((prev) => (replace || p === 1 ? mapped : [...prev, ...mapped]));
      setPerfTotal(data?.totalPages ?? 1);
      setPerfPage(p + 1);
    } catch {
      Alert.alert("실패", "공연 찜 목록을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  // 아티스트 불러오기
  const loadArtists = async (p: number, replace = false) => {
    if (loading || p > artistTotal) return;
    setLoading(true);
    try {
      const { data } = await http.get("/user/me/like/artist", {
        params: { page: p, size: 20 },
      });
      const mapped: ArtistFav[] = (data?.artists ?? []).map((a: any) => ({
        id: a.id,
        name: a.name,
        avatar: fixUrl(a.image_url),
      }));
      setArtistFavs((prev) => (replace || p === 1 ? mapped : [...prev, ...mapped]));
      setArtistTotal(data?.totalPages ?? 1);
      setArtistPage(p + 1);
    } catch {
      Alert.alert("실패", "아티스트 찜 목록을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  // 첫 로드
  useEffect(() => {
    loadPerformances(1, true);
    loadArtists(1, true);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (selectedTab === "performance") await loadPerformances(1, true);
    else await loadArtists(1, true);
    setRefreshing(false);
  }, [selectedTab]);

  // 찜 해제
  const handleUnlike = async (type: "performance" | "artist", id: number) => {
    const key = `${type}:${id}`;
    if (pending.has(key)) return;
    setPending((prev) => new Set(prev).add(key));

    const prevPerf = perfFavs;
    const prevArtist = artistFavs;

    if (type === "performance") {
      setPerfFavs((prev) => prev.filter((item) => item.id !== id));
    } else {
      setArtistFavs((prev) => prev.filter((item) => item.id !== id));
    }

    try {
      await http.delete(`/like/${id}`, { params: { type } });
    } catch {
      if (type === "performance") setPerfFavs(prevPerf);
      else setArtistFavs(prevArtist);
      Alert.alert("실패", "찜 해제에 실패했어요.");
    } finally {
      setPending((prev) => {
        const s = new Set(prev);
        s.delete(key);
        return s;
      });
    }
  };

  const TabHeader = useMemo(
    () => (
      <View style={styles.tabRow}>
        <Pressable onPress={() => setSelectedTab("performance")} hitSlop={8}>
          <Text
            style={[
              styles.tabText,
              selectedTab === "performance" ? styles.tabActive : styles.tabInactive,
            ]}
          >
            공연
          </Text>
        </Pressable>
        <Pressable onPress={() => setSelectedTab("artist")} hitSlop={8}>
          <Text
            style={[
              styles.tabText,
              selectedTab === "artist" ? styles.tabActive : styles.tabInactive,
            ]}
          >
            아티스트
          </Text>
        </Pressable>
      </View>
    ),
    [selectedTab]
  );

  const formatDate = (s?: string) =>
    s ? dayjs(s).format("YYYY.MM.DD dddd") : "";

  const renderPerf = ({ item }: { item: PerfFav }) => {
    const disabled = pending.has(`performance:${item.id}`);
    return (
      <View style={styles.row}>
        <Image source={{ uri: item.image ?? undefined }} style={styles.poster} />
        <View style={styles.infoBox}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.venue} numberOfLines={1}>
            {item.venue}
          </Text>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
        </View>
        <Pressable
          onPress={() => handleUnlike("performance", item.id)}
          disabled={disabled}
          hitSlop={8}
          style={styles.heartWrap}
        >
          <Heart size={18} fill="#FF4D4F" color="#FF4D4F"/>
        </Pressable>
      </View>
    );
  };

  const renderArtist = ({ item }: { item: ArtistFav }) => {
    const disabled = pending.has(`artist:${item.id}`);
    return (
      <View style={styles.row}>
        <Image source={{ uri: item.avatar ?? undefined }} style={styles.avatarRound} />
        <View style={styles.infoBox}>
          <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
        </View>
        <Pressable
          onPress={() => handleUnlike("artist", item.id)}
          disabled={disabled}
          hitSlop={8}
          style={styles.heartWrap}
        >
          <Heart size={18} color="#FF4D4F" fill="#FF4D4F" />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {TabHeader}

      {selectedTab === "performance" ? (
        <FlatList
          data={perfFavs}
          keyExtractor={(i) => `perf-${i.id}`}
          renderItem={renderPerf}
          onEndReached={() => loadPerformances(perfPage)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Empty text="찜한 공연이 없어요." />}
          ListFooterComponent={loading ? <ActivityIndicator style={{ margin: Theme.spacing.md }} /> : null}
        />
      ) : (
        <FlatList
          data={artistFavs}
          keyExtractor={(i) => `artist-${i.id}`}
          renderItem={renderArtist}
          onEndReached={() => loadArtists(artistPage)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Empty text="찜한 아티스트가 없어요." />}
          ListFooterComponent={loading ? <ActivityIndicator style={{ margin: Theme.spacing.md }} /> : null}
        />
      )}
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <View style={styles.emptyBox}>
      <HeartOff size={Theme.iconSizes.lg} color={Theme.colors.gray} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.white },

  tabRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 120,
    paddingVertical: Theme.spacing.md,
  },
  tabText: { fontSize: Theme.fontSizes.base, fontWeight: Theme.fontWeights.medium },
  tabActive: {
    color: Theme.colors.themeOrange,
    borderBottomWidth: Theme.spacing.xs/2,
    borderBottomColor: Theme.colors.themeOrange,
    paddingBottom: Theme.spacing.xs,
  },
  tabInactive: {
    color: Theme.colors.darkGray,
    borderBottomWidth: Theme.spacing.xs/2,
    borderBottomColor: "transparent",
    paddingBottom: Theme.spacing.xs,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.colors.lightGray,
    gap: Theme.spacing.md,
  },
  poster: {
    width: 60,           
    height: 60 * 1.25,  
    borderRadius: 8,
  },
  avatarRound: {
    width: 60, height: 60, borderRadius: 30,
  },
  infoBox: { flex: 1 },
  title: { fontSize: Theme.fontSizes.base, fontWeight: Theme.fontWeights.bold },
  venue: { marginTop: 2, color: Theme.colors.darkGray },
  date: { marginTop: 2, color: Theme.colors.darkGray },

  heartWrap: {
    width: Theme.iconSizes.lg, height: Theme.iconSizes.lg, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
        borderWidth: 1,
        borderColor: Theme.colors.lightGray,
  },

  emptyBox: { alignItems: "center", justifyContent: "center", paddingVertical: 24 },
  emptyText: { color: Theme.colors.gray, marginTop: Theme.spacing.md },
});
