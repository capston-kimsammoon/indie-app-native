import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, SafeAreaView, Text, View } from "react-native";
import Theme from "@/constants/Theme";
import { fetchUserInfo } from "@/api/UserApi";
import { fetchMyReviews, deleteReview } from "@/api/ReviewApi";
import ReviewCard from "@/components/cards/ReviewCard";
import type { NormalizedReview } from "@/types/review";

export default function MyReviewScreen() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [items, setItems] = useState<NormalizedReview[]>([]);
  const [page, setPage] = useState(1);
  const size = 20;
  const [hasMore, setHasMore] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<any>(null);

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
      const mapped = res.items.map(r => ({ ...r, isMine: true }));
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

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !isLoggedIn) return;
    setLoadingMore(true);
    try {
      const res = await fetchMyReviews({ page, size, order: "desc" });
      
      setItems((prev) => {
        const map = new Map<number, NormalizedReview>();
        [...prev, ...res.items.map(r => ({ ...r, isMine: true }))].forEach((it) => map.set(it.id, it));
        return Array.from(map.values());
      });
      setPage((p) => p + 1);
      if (res.items.length < size) setHasMore(false);
    } catch {
      setHasMore(false);
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

  useEffect(() => {
    if (authChecked) loadFirst();
  }, [authChecked, loadFirst]);

  const handleDelete = useCallback(
    (reviewId: number) => {
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Theme.colors.white }}>
      {initialLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : !isLoggedIn ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: Theme.colors.gray }}>로그인이 필요합니다.</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: Theme.colors.gray }}>불러오기에 실패했어요.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => `review-${item.id}`}
          renderItem={({ item }) => (
            <ReviewCard
              item={item}            
              onDelete={() => handleDelete(item.id)}
              showLike
              showVenueInfo
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          onEndReachedThreshold={0.3}
          onEndReached={loadMore}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: Theme.spacing.md }}>
              <Text style={{ color: Theme.colors.gray }}>작성한 리뷰가 없습니다.</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 12 }}>
                <ActivityIndicator />
              </View>
            ) : !hasMore && items.length > 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 12 }}>
                <Text style={{ color: Theme.colors.gray, fontSize: 12 }}>마지막 리뷰입니다.</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
