// app/(tabs)/venue/[id]/reviews.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import Theme from "@/constants/Theme";
import IcHeartFilled from "@/assets/icons/ic-heart-filled.svg";
import IcHeartOutline from "@/assets/icons/ic-heart-outline.svg";
import IcClose from "@/assets/icons/ic-close.svg";
import { fetchVenueReviewList, likeReview, unlikeReview, deleteVenueReview } from "@/api/ReviewApi";
import { ReviewItem } from "@/types/review";
import Images from "@/components/common/Images";
import { TEST_TOKEN } from "@env";
import { getUserIdFromToken } from "@/utils/auth";
import ReviewCard from "@/components/cards/ReviewCard";

const myUserId = getUserIdFromToken(TEST_TOKEN);

type RouteParams = { id: string };

export default function VenueReviewsPage() {
  const route = useRoute();
  const router = useRouter();
  const { id } = route.params as RouteParams;

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const IcHeartSize = Theme.iconSizes.sm;

  // --- 리뷰 불러오기 ---
  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchVenueReviewList(Number(id), { page: 1, size: 50 }, TEST_TOKEN);

      const items = data.items.map(r => ({
        ...r,
        author: r.user?.nickname ?? "익명",
        profile_url: r.user?.profile_url ?? "",
        images: r.images ?? [],
        isMine: r.user?.id === myUserId, // 내가 쓴 리뷰 판단
      }));

      setReviews(items);
      setTotal(data.total ?? items.length);
    } catch (err) {
      console.error("리뷰 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => {
    loadReviews();
  }, [id]));

  const goWriteReview = () => router.push(`/venue/${id}/review/write`);

  // --- 좋아요 토글 ---
  const handleLikeToggle = async (review: ReviewItem) => {
    setReviews(prev =>
      prev.map(r =>
        r.id === review.id
          ? { ...r, is_liked: !r.is_liked, like_count: r.is_liked ? r.like_count - 1 : r.like_count + 1 }
          : r
      )
    );

    try {
      if (review.is_liked) await unlikeReview(review.id, TEST_TOKEN);
      else await likeReview(review.id, TEST_TOKEN);
    } catch (err) {
      console.error("좋아요 실패", err);
      setReviews(prev =>
        prev.map(r =>
          r.id === review.id ? { ...r, is_liked: review.is_liked, like_count: review.like_count } : r
        )
      );
    }
  };

  // --- 리뷰 삭제 ---
  const handleDeleteReview = async (review: ReviewItem) => {
    Alert.alert("리뷰 삭제", "정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteVenueReview(review.id, TEST_TOKEN);
            setReviews(prev => prev.filter(r => r.id !== review.id));
            setTotal(prev => prev - 1);
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
        <Pressable style={styles.writeButton} onPress={goWriteReview}>
          <Text style={styles.writeButtonText}>리뷰 작성</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.themeOrange} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={reviews}
          renderItem={({ item }) => (
            <ReviewCard
              item={item}
              onDelete={handleDeleteReview}
              onToggleLike={handleLikeToggle}
              showLike={true} // 좋아요 버튼 표시
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          style={{paddingHorizontal: Theme.spacing.md}}
        />
      )}
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Theme.spacing.md, backgroundColor: Theme.colors.white, marginBottom: Theme.spacing.sm },
  totalText: { fontSize: Theme.fontSizes.base, fontWeight: Theme.fontWeights.medium },
  writeButton: { backgroundColor: Theme.colors.themeOrange, borderRadius: 10, padding: Theme.spacing.sm },
  writeButtonText: { color: Theme.colors.white, fontWeight: Theme.fontWeights.medium },
  card: { position: "relative", backgroundColor: Theme.colors.white, padding: Theme.spacing.md, marginBottom: Theme.spacing.md, borderRadius: 12, borderWidth: 1, borderColor: Theme.colors.lightGray },
  content: { fontSize: Theme.fontSizes.base, color: Theme.colors.black, textAlign: "left", marginBottom: Theme.spacing.md },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: Theme.colors.lightGray, marginRight: Theme.spacing.sm },
  author: { fontWeight: Theme.fontWeights.medium, fontSize: Theme.fontSizes.base, marginRight: Theme.spacing.sm, color: Theme.colors.black },
  date: { fontWeight: Theme.fontWeights.regular, fontSize: Theme.fontSizes.sm, color: Theme.colors.gray },
  likeButton: { flexDirection: "row", alignItems: "center" },
  likeCount: { marginLeft: Theme.spacing.xs, fontSize: Theme.fontSizes.sm },
  deleteBtn: { position: "absolute", top: Theme.spacing.sm, right: Theme.spacing.sm, zIndex: 10 },
});
