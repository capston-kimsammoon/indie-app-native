import React from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { ReviewItem } from '@/types/review';
import IcClose from '@/assets/icons/ic-close.svg';
import Theme from '@/constants/Theme';
import Images from '@/components/common/Images';
import IcHeartFilled from "@/assets/icons/ic-heart-filled.svg";
import IcHeartOutline from "@/assets/icons/ic-heart-outline.svg";
import { getDateFromDateString } from '@/utils/dateUtils';

interface Props {
  item: ReviewItem;
  onDelete?: (review: ReviewItem) => void;
  onToggleLike?: (review: ReviewItem) => void;
  onPress?: () => void;
  onReport?: (review: ReviewItem) => void;
  showLike?: boolean; // 전체 리뷰 페이지에서는 false
  showVenueInfo?: boolean;
}

export default function ReviewCard({ item, onDelete, onToggleLike, onReport, onPress, showLike = true, showVenueInfo = false }: Props) {

  const router = useRouter();

  const handleVenuePress = () => {
    if (item.venue?.id) {
      router.push(`/venue/${item.venue.id}`);
    }
  };

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {/* 삭제 버튼 */}
      {item?.isMine && onDelete && (
        <Pressable style={styles.deleteBtn} onPress={() => onDelete(item)}>
          <IcClose width={Theme.iconSizes.sm} height={Theme.iconSizes.sm} fill={Theme.colors.darkGray} />
        </Pressable>
      )}

      {/* 리뷰 이미지 */}
      {item.images?.length > 0 && (
        <Images
          images={item.images.map(uri => ({ image_url: uri }))}
          imageSize={80}
        />
      )}

      {/* 리뷰 텍스트 */}
      <Text style={styles.content}>{item.content || item.text}</Text>

      <View style={styles.footer}>
        <Pressable style={styles.userInfo} onPress={showVenueInfo ? handleVenuePress : undefined}>
          <Image
            source={{
              uri: showVenueInfo
                ? item.venue?.logo_url || require('@/assets/images/modie-sample.png')
                : item.profile_url || require('@/assets/images/modie-sample.png'),
            }}
            style={styles.avatar}
          />

          <View style={styles.userInfo}>
            <Text style={styles.author} numberOfLines={1}>{showVenueInfo ? item.venue?.name : item.author}</Text>
            <Text style={styles.date}>{getDateFromDateString(item.created_at)}</Text>
          </View>
        </Pressable>

        <View style={styles.rightButtons}>
          {!item.isMine && (
            <Pressable onPress={() => onReport && onReport(item)}>
              <Text style={styles.reportText}>신고</Text>
            </Pressable>
          )}

          {showLike && (
            <Pressable
              style={styles.likeInfo}
              onPress={() => onToggleLike && onToggleLike(item)}
            >
              {item.is_liked ? (
                <IcHeartFilled width={18} height={18} fill={Theme.colors.themeOrange} />
              ) : (
                <IcHeartOutline width={18} height={18} stroke={Theme.colors.gray} />
              )}
              <Text style={styles.likeCount}>{item.like_count}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    position: 'relative',
  },
  deleteBtn: { position: 'absolute', top: 6, right: 6, zIndex: 10 },
  content: { fontSize: Theme.fontSizes.base, color: Theme.colors.black, marginBottom: Theme.spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { flexDirection: 'row', alignItems: 'center', alignContent: "center" },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: Theme.colors.lightGray, marginRight: Theme.spacing.sm, borderWidth: 1, borderColor: Theme.colors.lightGray },
  author: { fontWeight: Theme.fontWeights.medium, fontSize: Theme.fontSizes.base, color: Theme.colors.black, marginRight: Theme.spacing.sm, maxWidth: 155 },
  date: { fontSize: Theme.fontSizes.sm, color: Theme.colors.gray },
  venue: { fontSize: Theme.fontSizes.sm, color: Theme.colors.themeOrange },
  likeInfo: { flexDirection: 'row', alignItems: 'center', marginLeft: Theme.spacing.sm },
  likeCount: { marginLeft: Theme.spacing.xs, fontSize: Theme.fontSizes.sm },
  reportText: { textAlign: "center", textDecorationLine: "underline", color: Theme.colors.gray },
  rightButtons: { flexDirection: "row", alignContent: "center",  }
});
