import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Alert, RefreshControl, Text } from 'react-native';
import { fetchUserInfo } from "@/api/UserApi";
import { fetchAllReviews, deleteReview, reportReview } from '@/api/ReviewApi';
import type { NormalizedReview } from '@/types/review';
import ReviewCard from '@/components/cards/ReviewCard';
import Theme from '@/constants/Theme';
import { ReviewItem } from "@/types/review";

export default function AllReviewsPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [reviews, setReviews] = useState<NormalizedReview[]>([]);
  const [loading, setLoading] = useState(true);       // 초기 로딩 or 하단 추가 로딩
  const [refreshing, setRefreshing] = useState(false); // 당겨서 새로고침 로딩
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reviewToReport, setReviewToReport] = useState<ReviewItem | null>(null);

  const size = 20;

  useEffect(() => {
    (async () => {
      try {
        const me = await fetchUserInfo();
        setUserId(me?.id ?? null);
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  const loadReviews = useCallback(async (nextPage = 1, append = false) => {
    if (!authChecked) return;

    try {
      if (!append && nextPage === 1) setRefreshing(true);
      else setLoading(true);

      const { items, total } = await fetchAllReviews({ page: nextPage, size });
      const mapped = items.map(r => ({ ...r, isMine: r.user_id === userId }));

      setReviews(prev => {
        const merged = append ? [...prev, ...mapped] : mapped;

        // 중복 제거
        const unique = merged.filter((v, i, self) => self.findIndex(r => r.id === v.id) === i);

        // hasMore 계산
        setHasMore(unique.length < total);

        return unique;
      });

      setPage(nextPage);
    } catch (err) {
      console.error('리뷰 불러오기 실패', err);
      Alert.alert('리뷰 불러오기 실패', '전체 리뷰를 가져오지 못했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authChecked, userId]);

  useEffect(() => {
    loadReviews(1, false);
  }, [loadReviews]);

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


  const handleDelete = async (review: NormalizedReview) => {
    Alert.alert("리뷰 삭제", "정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteReview(review.id);
            setReviews((prev) => prev.filter((r) => r.id !== review.id));
          } catch (err) {
            console.error('리뷰 삭제 실패', err);
            Alert.alert('리뷰 삭제 실패', '잠시 후 다시 시도해주세요.');
          }
        },
      },
    ]);
  };

  if (loading && reviews.length === 0 && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Theme.colors.themeOrange} />
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: Theme.colors.white, flex: 1 }}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => `review-${item.id}`}
        renderItem={({ item }) => (
          <ReviewCard
            item={item}
            showLike={false}
            showVenueInfo={true}
            onDelete={() => handleDelete(item)}
            onReport={() => onReportPress(item)}
          />
        )}
        contentContainerStyle={{ padding: Theme.spacing.md }}
        onEndReached={() => {
          if (!loading && hasMore) {
            loadReviews(page + 1, true);
          }
        }}
        onEndReachedThreshold={0.2} // 화면 끝에서 20% 남았을 때 호출
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadReviews(1, false)} />
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: Theme.spacing.md }}>
            <Text style={{ color: Theme.colors.gray }}>작성된 리뷰가 없습니다.</Text>
          </View>
        }
        ListFooterComponent={
          loading && reviews.length > 0 ? (
            <ActivityIndicator style={{ margin: Theme.spacing.sm }} />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
