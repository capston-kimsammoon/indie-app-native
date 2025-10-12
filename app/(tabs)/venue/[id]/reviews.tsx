import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import Theme from "@/constants/Theme";
import {
  fetchVenueReviewList,
  likeReview,
  unlikeReview,
  deleteReview,
  reportReview
} from "@/api/ReviewApi";
import { ReviewItem } from "@/types/review";
import ReviewCard from "@/components/cards/ReviewCard";
import { fetchUserInfo } from "@/api/UserApi";
import { requireLogin } from "@/utils/auth";
import ReportModal from "@/components/filters/ReportModal";

type RouteParams = { id: string };

export default function VenueReviewsPage() {
  const route = useRoute();
  const router = useRouter();
  const { id } = route.params as RouteParams;

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reviewToReport, setReviewToReport] = useState<ReviewItem | null>(null);

  // ── 로그인 유저 정보 가져오기 ──
  useEffect(() => {
    (async () => {
      try {
        const me = await fetchUserInfo();
        setCurrentUserId(me?.id ?? null);
      } catch {
        setCurrentUserId(null);
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  // ── 리뷰 불러오기 ──
  const loadReviews = useCallback(async (pageNum: number, replace = false) => {
    if (!authChecked) return;
    if (loading) return;
    setLoading(true);

    try {
      const data = await fetchVenueReviewList(Number(id), { page: pageNum, size: 10 });

      // 현재 로그인한 유저와 비교해서 isMine 계산
      const mappedItems = data.items.map((r) => ({
        ...r,
        isMine: r.user_id === currentUserId,
      }));

      if (replace) setReviews(mappedItems);
      else setReviews((prev) => [...prev, ...mappedItems]);
      setTotal(data.total ?? mappedItems.length);
      setHasMore(mappedItems.length > 0);
      setPage(pageNum);
    } catch (err) {
      console.error("리뷰 로드 실패:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, currentUserId, authChecked, loading]);

  // ── 초기 로드 ──
  useFocusEffect(
    useCallback(() => {
      if (authChecked) loadReviews(1, true);
    }, [id, currentUserId, authChecked])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadReviews(1, true);
  };

  const onEndReached = () => {
    if (hasMore && !loading) {
      loadReviews(page + 1);
    }
  };

  const handleLikeToggle = async (review: ReviewItem) => {
    requireLogin(async () => {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === review.id
            ? { ...r, is_liked: !r.is_liked, like_count: (r.like_count ?? 0) + (r.is_liked ? -1 : 1) }
            : r
        )
      );

      try {
        if (review.is_liked) await unlikeReview(review.id);
        else await likeReview(review.id);
      } catch (err) {
        console.error("좋아요 실패", err);
        setReviews((prev) =>
          prev.map((r) => (r.id === review.id ? { ...r, ...review } : r))
        );
      }
    });
  };

  const handleDeleteReview = async (review: ReviewItem) => {
    Alert.alert("리뷰 삭제", "정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteReview(review.id);
            setReviews((prev) => prev.filter((r) => r.id !== review.id));
            setTotal((prev) => Math.max(0, prev - 1));
          } catch (err: any) {
            console.error("리뷰 삭제 실패", err);
            Alert.alert("리뷰 삭제 실패", err.message || "");
          }
        },
      },
    ]);
  };

  const onReportPress = (review: ReviewItem) => {
    setReviewToReport(review);
    setReportModalVisible(true);
  };

  const handleReportSubmit = async (type: ReportType) => {
    if (!reviewToReport) return;
    try {
      const res = await reportReview(reviewToReport.id, type); 
      // 백엔드에서 이미 신고된 경우 400/409 같은 상태 코드 반환한다고 가정
      if (res?.alreadyReported) {
        alert("이미 신고한 리뷰입니다.");
      } else {
        alert("신고가 접수되었습니다.");
      }
    } catch (e: any) {
      if (e.response?.status === 409) {
        alert("이미 신고한 리뷰입니다.");
      } else {
        alert("신고에 실패했습니다.");
        console.error(e);
      }
    } finally {
      setReportModalVisible(false);
      setReviewToReport(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.white }}>
      <View style={styles.header}>
        <Text style={styles.totalText}>
          All <Text style={styles.totalNum}>{total}</Text>
        </Text>
        <TouchableOpacity onPress={() => requireLogin(() => router.push(`/venue/${id}/review/write`))}>
          <Text style={styles.writeButtonText}>리뷰 작성</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reviews}
        renderItem={({ item }) => (
          <ReviewCard
            item={item}
            onDelete={handleDeleteReview}
            onToggleLike={handleLikeToggle}
            onReport={() => onReportPress(item)}
            showLike={true}
            showVenueInfo={false}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.2}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: Theme.spacing.md }}>
            <Text style={{ color: Theme.colors.gray }}>작성된 리뷰가 없습니다.</Text>
          </View>
        }
        ListFooterComponent={
          loading ? (
            <ActivityIndicator
              size="small"
              color={Theme.colors.themeOrange}
              style={{ marginVertical: 20 }}
            />
          ) : null
        }
        style={{ paddingHorizontal: Theme.spacing.md }}
      />
      <ReportModal
        visible={reportModalVisible}
        onCancel={() => setReportModalVisible(false)}
        onSubmit={handleReportSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
    marginVertical: Theme.spacing.sm,
  },
  totalText: { color: Theme.colors.darkGray, fontSize: Theme.fontSizes.sm, fontWeight: Theme.fontWeights.bold },
  totalNum: { color: Theme.colors.themeOrange, fontWeight: Theme.fontWeights.bold },
  writeButtonText: {
    backgroundColor: Theme.colors.themeOrange,
    color: Theme.colors.white,
    borderRadius: 10,
    overflow: "hidden",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    fontWeight: Theme.fontWeights.medium as any,
  },
});
