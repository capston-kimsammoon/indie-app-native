import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { fetchAllReviews, deleteVenueReview, likeReview, unlikeReview } from '@/api/ReviewApi';
import { ReviewItem } from '@/types/review';
import ReviewCard from '@/components/cards/ReviewCard';
import Theme from '@/constants/Theme';
import { TEST_TOKEN } from '@env';

export default function AllReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 리뷰 불러오기
  const loadReviews = async (nextPage = 1, append = false) => {
    try {
      setLoading(true);
      const { items, total } = await fetchAllReviews({ page: nextPage, size: 20 });

      if (append) {
        setReviews((prev) => [...prev, ...items]);
      } else {
        setReviews(items);
      }

      setHasMore(items.length > 0 && reviews.length + items.length < total);
      setPage(nextPage);
    } catch (err) {
      console.error('리뷰 불러오기 실패', err);
      Alert.alert('리뷰 불러오기 실패', '전체 리뷰를 가져오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews(1, false);
  }, []);

  // 리뷰 삭제
  const handleDelete = async (review: ReviewItem) => {
    Alert.alert("리뷰 삭제", "정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteVenueReview(review.id, TEST_TOKEN);
            setReviews((prev) => prev.filter((r) => r.id !== review.id));
          } catch (err) {
            console.error('리뷰 삭제 실패', err);
            Alert.alert('리뷰 삭제 실패', '잠시 후 다시 시도해주세요.');
          }
        },
      },
    ]);
  };

  if (loading && reviews.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Theme.colors.themeOrange} />
      </View>
    );
  }

  return (
    <View style={{backgroundColor: Theme.colors.white}}>
      <FlatList
        data={reviews.filter(Boolean)}
        keyExtractor={(item) => `review-${item.id}`}
        renderItem={({ item }) =>
          item ? (
            <ReviewCard
              item={item}
              showLike={false}        // 전체 리뷰 페이지에서는 하트 숨김
              showVenueInfo={true}    // 공연장 정보 표시
              onDelete={handleDelete}
            />
          ) : null
        }
        contentContainerStyle={{ padding: Theme.spacing.md }}
        onEndReached={() => hasMore && loadReviews(page + 1, true)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="small" color={Theme.colors.themeOrange} /> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', },
});
