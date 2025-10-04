import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Alert, Pressable, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import dayjs from "dayjs";
import "dayjs/locale/ko";
dayjs.locale("ko");

import http from "../../api/http";
import config from "../../api/config";
import Theme from "@/constants/Theme";

import PerformanceCard from "@/components/cards/PerformanceCard";
import ArtistCard from "@/components/cards/ArtistCard";
import { HeartOff } from "lucide-react-native";

const fixUrl = (u?: string | null) =>
  typeof u === "string" ? u.replace("http://127.0.0.1:8000", config.baseUrl) : null;

type PerfFav = {
  id: number;
  title: string;
  venue: string;
  date: string;
  image: string | null;
};
type ArtistFav = { id: number; name: string; avatar: string | null };

export default function FavoritePage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<"performance" | "artist">("performance");

  const [perfFavs, setPerfFavs] = useState<PerfFav[]>([]);
  const [perfPage, setPerfPage] = useState(1);
  const [perfTotal, setPerfTotal] = useState(1);

  const [artistFavs, setArtistFavs] = useState<ArtistFav[]>([]);
  const [artistPage, setArtistPage] = useState(1);
  const [artistTotal, setArtistTotal] = useState(1);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pending, setPending] = useState<Set<string>>(new Set());

  const loadPerformances = async (p: number, replace = false) => {
    if (loading || p > perfTotal) return;
    setLoading(true);
    try {
      const { data } = await http.get("/user/me/like/performance", { params: { page: p, size: 20 } });
      const mapped: PerfFav[] = (data?.performances ?? []).map((x: any) => ({
        id: x.id,
        title: x.title,
        venue: x.venue,
        date: x.date,
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

  const loadArtists = async (p: number, replace = false) => {
    if (loading || p > artistTotal) return;
    setLoading(true);
    try {
      const { data } = await http.get("/user/me/like/artist", { params: { page: p, size: 20 } });
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

  const handleUnlike = async (type: "performance" | "artist", id: number) => {
    const key = `${type}:${id}`;
    if (pending.has(key)) return;
    setPending((prev) => new Set(prev).add(key));

    const prevPerf = perfFavs;
    const prevArtist = artistFavs;

    if (type === "performance") setPerfFavs((prev) => prev.filter((item) => item.id !== id));
    else setArtistFavs((prev) => prev.filter((item) => item.id !== id));

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

  const TabHeader = useMemo(() => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tabButton, selectedTab === "performance" && styles.activeTab]}
        onPress={() => setSelectedTab("performance")}
      >
        <Text style={[styles.tabText, selectedTab === "performance" && styles.activeTabText]}>
          공연
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, selectedTab === "artist" && styles.activeTab]}
        onPress={() => setSelectedTab("artist")}
      >
        <Text style={[styles.tabText, selectedTab === "artist" && styles.activeTabText]}>
          아티스트
        </Text>
      </TouchableOpacity>
    </View>
  ), [selectedTab]);

  const formatDate = (s?: string) => s ? dayjs(s).format("YYYY.MM.DD dddd") : "";

  const renderPerf = ({ item }: { item: PerfFav }) => {
    const disabled = pending.has(`performance:${item.id}`);
    return (
      <PerformanceCard
        type="list"
        title={item.title}
        venue={item.venue}
        date={formatDate(item.date)}
        posterUrl={item.image ?? ""}
        showHeart
        liked={true}
        onPress={() => router.push(`/performance/${item.id}`)}
        onToggleLike={() => handleUnlike("performance", item.id)}
      />
    );
  };

  const renderArtist = ({ item }: { item: ArtistFav }) => {
    const disabled = pending.has(`artist:${item.id}`);
    return (
      <ArtistCard
        id={String(item.id)}
        name={item.name}
        profileUrl={item.avatar ?? ""}
        liked
        onPress={() => router.push(`/artist/${item.id}`)}
        onToggleLike={() => handleUnlike("artist", item.id)}
      />
    );
  };

  const Empty = ({ text }: { text: string }) => (
    <View style={styles.emptyBox}>
      <HeartOff size={Theme.iconSizes.lg} color={Theme.colors.gray} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.white },
  tabBar: { flexDirection: "row", borderBottomWidth: 1, borderColor: Theme.colors.lightGray, margin: Theme.spacing.md },
  tabButton: { flex: 1, paddingVertical: Theme.spacing.md, alignItems: "center" },
  activeTab: { borderBottomWidth: 2, borderColor: Theme.colors.themeOrange },
  tabText: { fontSize: Theme.fontSizes.base, fontWeight: Theme.fontWeights.medium, color: Theme.colors.darkGray },
  activeTabText: { color: Theme.colors.themeOrange, fontWeight: Theme.fontWeights.bold },
  emptyBox: { alignItems: "center", justifyContent: "center", paddingVertical: 24 },
  emptyText: { color: Theme.colors.gray, marginTop: Theme.spacing.md },
});
