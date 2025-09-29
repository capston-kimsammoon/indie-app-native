import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { ReviewItem } from '@/types/review';
import IcClose from '@/assets/icons/ic-close.svg';
import Theme from '@/constants/Theme';
import Images from '@/components/common/Images';

interface Props {
  item: ReviewItem;
  onDelete?: (review: ReviewItem) => void;
  showLike?: boolean; // 전체 리뷰 페이지에서는 false
}

export default function ReviewCard({ item, onDelete, showLike = true }: Props) {
  return (
    <View style={styles.card}>
      {item.is_mine && onDelete && (
        <Pressable style={styles.deleteBtn} onPress={() => onDelete(item)}>
          <IcClose width={Theme.iconSizes.sm} height={Theme.iconSizes.sm} fill={Theme.colors.darkGray} />
        </Pressable>
      )}

      {item.images?.length > 0 && <Images images={item.images} imageSize={80} />}

      <Text style={styles.content}>{item.content}</Text>

      <View style={styles.footer}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: item.profile_url || 'https://via.placeholder.com/80' }}
            style={styles.avatar}
          />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.author}>{item.author}</Text>
            <Text style={styles.date}>{item.created_at?.slice(0, 10).replace(/-/g, '.')}</Text>
            {item.venue && <Text style={styles.venue}>{item.venue.name}</Text>}
          </View>
        </View>

        {showLike && (
          <View style={styles.likeInfo}>
            <Text style={styles.likeCount}>{item.like_count}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.white,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    position: 'relative',
  },
  deleteBtn: { position: 'absolute', top: 6, right: 6, zIndex: 10 },
  content: { fontSize: Theme.fontSizes.base, color: Theme.colors.black, marginBottom: Theme.spacing.md },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: Theme.colors.lightGray },
  author: { fontWeight: Theme.fontWeights.medium, fontSize: Theme.fontSizes.base, color: Theme.colors.black },
  date: { fontSize: Theme.fontSizes.sm, color: Theme.colors.gray },
  venue: { fontSize: Theme.fontSizes.sm, color: Theme.colors.themeOrange },
  likeInfo: { flexDirection: 'row', alignItems: 'center' },
  likeCount: { marginLeft: Theme.spacing.xs, fontSize: Theme.fontSizes.sm },
});
