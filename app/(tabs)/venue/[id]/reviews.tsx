// app/(tabs)/venue/[id]/reviews.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import Theme from "@/constants/Theme";
import {
  fetchVenueReviewList,
  likeReview,
  unlikeReview,
  deleteVenueReview,
} from "@/api/ReviewApi";
import { ReviewItem } from "@/types/review";
import ReviewCard from "@/components/cards/ReviewCard";
import { useAuthStore } from "@/src/state/authStore";

type RouteParams = { id: string };

export default function VenueReviewsPage() {
  const route = useRoute();
  const router = useRouter();
  const { id } = route.params as RouteParams;

  // 로그인 유저 ID (없으면 null)
  const currentUserId = useAuthStore((s) => s.user?.id ?? null);

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // ── 리뷰 불러오기 ───────────────────────────────────────────────
  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchVenueReviewList(Number(id), {
        page: 1,
        size: 50,
        currentUserId, // 서버가 쓰든 안 쓰든 옵션으로 전달
      });

      // 서버 응답을 우리 ReviewItem 형태로 안전 매핑
      const items: ReviewItem[] = (data.items || []).map((r: any) => ({
        id: r.id,
        author: r.user?.nickname ?? r.author ?? "익명",
        content: r.content ?? "",
        created_at: r.created_at ?? "",
        profile_url: (r.user?.profile_url ?? r.profile_url ?? "").trim(),
        like_count:
          typeof r.like_count === "number"
            ? r.like_count
            : Number(r.likeCount ?? 0),
        is_liked: !!(r.is_liked ?? r.isLiked),
        images: r.images ?? [],
        isMine:
          typeof r.is_mine === "boolean"
            ? r.is_mine
            : currentUserId != null
            ? r.user?.id === currentUserId
            : false,
        venue: r.venue ?? null,
      }));

      setReviews(items);
      setTotal(data.total ?? items.length);
    } catch (err) {
      console.error("리뷰 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReviews();
    }, [id, currentUserId])
  );

  const goWriteReview = () => router.push(`/venue/${id}/review/write`);

  // ── 좋아요 토글 (snake_case) ───────────────────────────────────
  const handleLikeToggle = async (review: ReviewItem) => {
    // optimistic UI
    setReviews((prev) =>
      prev.map((r) =>
        r.id === review.id
          ? {
              ...r,
              is_liked: !r.is_liked,
              like_count:
                (r.like_count ?? 0) + (r.is_liked ? -1 : 1),
            }
          : r
      )
    );

    try {
      if (review.is_liked) await unlikeReview(review.id);
      else await likeReview(review.id);
    } catch (err) {
      console.error("좋아요 실패", err);
      // rollback
      setReviews((prev) =>
        prev.map((r) =>
          r.id === review.id
            ? {
                ...r,
                is_liked: review.is_liked,
                like_count: review.like_count ?? 0,
              }
            : r
        )
      );
    }
  };

  // ── 리뷰 삭제 ──────────────────────────────────────────────────
  const handleDeleteReview = async (review: ReviewItem) => {
    Alert.alert("리뷰 삭제", "정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteVenueReview(review.id);
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

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.white }}>
      <View style={styles.header}>
        <Text style={styles.totalText}>총 {total}개</Text>
        <Text onPress={goWriteReview} style={styles.writeButtonText}>
          리뷰 작성
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={Theme.colors.themeOrange}
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={reviews}
          renderItem={({ item }) => (
            <ReviewCard
              item={item}
              onDelete={handleDeleteReview}
              onToggleLike={handleLikeToggle}
              showLike={true}
              showVenueInfo={false}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          style={{ paddingHorizontal: Theme.spacing.md }}
        />
      )}
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
    marginBottom: Theme.spacing.sm,
  },
  totalText: {
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.medium as any,
  },
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
