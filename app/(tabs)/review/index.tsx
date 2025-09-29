import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { fetchAllReviews } from '@/api/ReviewApi';
import { ReviewItem } from '@/types/review';
import ReviewCard from '@/components/cards/ReviewCard';
import Theme from '@/constants/Theme';
import { TEST_TOKEN } from '@env';

export default function AllReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const { items } = await fetchAllReviews({ page: 1, size: 20 }, TEST_TOKEN);
      setReviews(items);
    } catch (err) {
      console.error('리뷰 불러오기 실패', err);
      Alert.alert('리뷰 불러오기 실패', '전체 리뷰를 가져오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  return loading ? (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={Theme.colors.themeOrange} />
    </View>
  ) : (
    <FlatList
      data={reviews}
      keyExtractor={(item) => `review-${item.id}`}
      renderItem={({ item }) => <ReviewCard item={item} showLike={false} />}
      contentContainerStyle={{ padding: Theme.spacing.md }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
