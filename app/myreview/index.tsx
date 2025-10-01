// app/myreview/index.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { X as XIcon } from "lucide-react-native";

import Theme from "@/constants/Theme";
import { fetchUserInfo } from "@/api/userApi";
import {
  fetchMyReviews,
  likeReview,
  unlikeReview,
  deleteReview,
  NormalizedReview,
} from "@/api/ReviewApi";

// ---- 화면 전용 타입 ----
type UIReview = {
  id: number;
  user: { id: number | null; nickname: string; profile_url: string };
  text: string;
  images: string[];
  created_at: string;
  like_count: number;
  liked_by_me: boolean;
  venue_id?: number | null;
  venue_name?: string;
};

const mapNormalizedToUI = (x: NormalizedReview): UIReview => ({
  id: Number(x.id),
  user: {
    id: (x.user_id ?? null) as number | null,
    nickname: x.author || "익명",
    profile_url: (x.profile_url ?? "") as string,
  },
  text: x.text ?? "",
  images: Array.isArray(x.images) ? x.images : [],
  created_at: x.created_at ?? "",
  like_count: Number(x.like_count ?? 0),
  liked_by_me: Boolean(x.is_liked ?? false),
  venue_id: x.venue_id ?? null,
  venue_name: x.venue_name ?? "",
});

export default function MyReviewScreen() {
  const params = useLocalSearchParams<{ search?: string }>();

  // 인증
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 데이터 & 페이지
  const [items, setItems] = useState<UIReview[]>([]);
  const [page, setPage] = useState(1);
  const size = 20; // 서버 최대 100
  const [hasMore, setHasMore] = useState(false);

  // 로딩/에러
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<any>(null);

  // 검색
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (params?.search) setSearchOpen(true);
  }, [params?.search]);

  // 로그인 상태
  useEffect(() => {
    (async () => {
      try {
        const me = await fetchUserInfo();
        setIsLoggedIn(!!me?.id);
      } catch {
        setIsLoggedIn(false);
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  // 첫 페이지 로드
  const loadFirst = useCallback(async () => {
    if (!isLoggedIn) {
      setItems([]);
      setHasMore(false);
      setInitialLoading(false);
      return;
    }
    setInitialLoading(true);
    setError(null);
    try {
      const res = await fetchMyReviews({ page: 1, size, order: "desc" });
      const mapped = (res.items ?? []).map(mapNormalizedToUI);
      setItems(mapped);
      setPage(2);
      setHasMore(mapped.length >= size);
    } catch (e) {
      setItems([]);
      setHasMore(false);
      setError(e);
    } finally {
      setInitialLoading(false);
    }
  }, [isLoggedIn]);

  // 더 가져오기
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !isLoggedIn) return;
    setLoadingMore(true);
    try {
      const res = await fetchMyReviews({ page, size, order: "desc" });
      const mapped = (res.items ?? []).map(mapNormalizedToUI);
      setItems((prev) => {
        const m = new Map<number, UIReview>();
        [...prev, ...mapped].forEach((it) => m.set(it.id, it));
        return Array.from(m.values());

      });
      setPage((p) => p + 1);
      if (mapped.length < size) setHasMore(false);
    } catch (e) {
      setHasMore(false);
      setError(e);
    } finally {
      setLoadingMore(false);
    }
  }, [page, size, hasMore, loadingMore, isLoggedIn]);

  const onRefresh = useCallback(async () => {
    if (!isLoggedIn) return;
    setRefreshing(true);
    try {
      await loadFirst();
    } finally {
      setRefreshing(false);
    }
  }, [isLoggedIn, loadFirst]);

  // auth 끝나면 첫 로드
  useEffect(() => {
    if (authChecked) loadFirst();
  }, [authChecked, loadFirst]);

  // 좋아요 토글(낙관적)
  const handleToggleLike = useCallback(
    async (reviewId: number) => {
      if (!isLoggedIn) return;
      const target = items.find((it) => it.id === reviewId);
      if (!target) return;

      const nextLiked = !target.liked_by_me;

      // 낙관적 업데이트
      setItems((prev) =>
        prev.map((it) =>
          it.id === reviewId
            ? {
                ...it,
                liked_by_me: nextLiked,
                like_count: Math.max(0, it.like_count + (nextLiked ? 1 : -1)),
              }
            : it
        )
      );

      try {
        if (nextLiked) await likeReview(reviewId);
        else await unlikeReview(reviewId);
      } catch {
        // 롤백
        setItems((prev) =>
          prev.map((it) =>
            it.id === reviewId
              ? { ...it, liked_by_me: target.liked_by_me, like_count: target.like_count }
              : it
          )
        );
        Alert.alert("오류", "좋아요 처리에 실패했어요.");
      }
    },
    [isLoggedIn, items]
  );

  // 삭제
  const handleDelete = useCallback(
    async (reviewId: number) => {
      if (!isLoggedIn) return;
      Alert.alert("삭제할까요?", "이 리뷰를 삭제합니다.", [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteReview(reviewId);
              setItems((prev) => prev.filter((it) => it.id !== reviewId));
            } catch {
              Alert.alert("삭제 실패", "잠시 후 다시 시도해주세요.");
            }
          },
        },
      ]);
    },
    [isLoggedIn]
  );

  // 검색 필터
  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return items;
    return items.filter(
      (r) =>
        r.text.toLowerCase().includes(key) ||
        r.user.nickname.toLowerCase().includes(key) ||
        (r.venue_name || "").toLowerCase().includes(key)
    );
  }, [items, q]);

  const renderItem = useCallback(
    ({ item }: { item: UIReview }) => (
      <View style={styles.card}>
        <Pressable hitSlop={8} onPress={() => handleDelete(item.id)} style={styles.deleteBtnTop}>
          <XIcon size={15} />
        </Pressable>

        <Text style={styles.reviewText} numberOfLines={6}>
          {item.text}
        </Text>

        <View style={styles.cardBottom}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>🎵</Text>
            </View>
            <Text style={styles.userName}>
              {item.user.nickname}
              {item.venue_name ? ` · ${item.venue_name}` : ""}
            </Text>
          </View>

          <Pressable hitSlop={10} onPress={() => handleToggleLike(item.id)} style={styles.likeBtn}>
            <Ionicons
              name={item.liked_by_me ? "heart" : "heart-outline"}
              size={16}
              color={item.liked_by_me ? "#ef4444" : "#9ca3af"}
            />
            <Text style={styles.likeText}>{item.like_count}</Text>
          </Pressable>
        </View>
      </View>
    ),
    [handleDelete, handleToggleLike]
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
            placeholder="리뷰/닉네임/공연장 검색"
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
            <Pressable onPress={() => setSearchOpen(false)} hitSlop={10}>
              <Ionicons name="close" size={18} color="#bbb" />
            </Pressable>
          )}
        </View>
      )}

      {initialLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : !isLoggedIn ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>로그인이 필요합니다.</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>불러오기에 실패했어요.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(it) => String(it.id)}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={styles.listContent}
          onEndReachedThreshold={0.3}
          onEndReached={() => {
            if (!loadingMore && hasMore) loadMore();
          }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>작성한 리뷰가 없어요.</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 12 }}>
                <ActivityIndicator />
              </View>
            ) : !hasMore && filtered.length > 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 12 }}>
                <Text style={styles.footerText}>마지막 리뷰입니다.</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors?.white ?? "#fff" },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  searchBarWrap: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Theme.colors?.lightGray ?? "#e5e7eb",
    marginHorizontal: Theme.spacing?.md ?? 16,
    marginTop: 8,
    paddingHorizontal: Theme.spacing?.sm ?? 8,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors?.white ?? "#fff",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: Theme.fontSizes?.sm ?? 14,
    color: Theme.colors?.black ?? "#111827",
    paddingVertical: 4,
  },

  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },

  card: {
    position: "relative",
    paddingHorizontal: Theme.spacing?.md ?? 16,
    paddingVertical: Theme.spacing?.sm ?? 8,
    borderRadius: 8,
    backgroundColor: Theme.colors?.white ?? "#fff",
    borderWidth: 1,
    borderColor: Theme.colors?.lightGray ?? "#e5e7eb",
  },

  deleteBtnTop: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 18,
    height: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },

  reviewText: { fontSize: 15, lineHeight: 22, color: "#111", paddingRight: 28 },

  cardBottom: { marginTop: 12, flexDirection: "row", alignItems: "center" },
  userRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },

  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#f2f6ff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e1e7ff",
  },
  avatarText: { fontSize: 12 },
  userName: { fontSize: 12, color: "#6b7280", fontWeight: "600" },

  likeBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 8, paddingVertical: 4 },
  likeText: { fontSize: 12, color: "#6b7280" },

  emptyWrap: { alignItems: "center", paddingTop: 64 },
  emptyText: { color: "#9ca3af" },
  footerText: { color: "#9ca3af", fontSize: 12 },
});
