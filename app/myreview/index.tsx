import React, { useMemo, useState, useEffect } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { X as XIcon } from "lucide-react-native"; 

import Theme from "@/constants/Theme";

type Review = {
  id: number;
  text: string;
  venue: string;
  avatar?: string; 
};

const INITIAL_REVIEWS: Review[] = [
  { id: 1, text: "여기 화장실 깨끗해서 좋아요", venue: "언드", avatar: "🌸" },
  {
    id: 2,
    text: "음향 빵빵하고 넓어서 좋음 홍입에서 걸어서 10분도 안 걸림 에어컨도 시원함",
    venue: "언플러그드 홍대",
    avatar: "🦄",
  },
  {
    id: 3,
    text: "여기 음료 따로 팔아서 음료 반입 안되어 근데 여기 음료 싸고 맛있어서 ㄱㅊ 레몬에이드가 젤 맛있음",
    venue: "CLUB FF",
    avatar: "🐼",
  },
];

export default function MyReviewsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ search?: string }>();

  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (params?.search) setSearchOpen(true);
  }, [params?.search]);

  const data = useMemo(() => {
    if (!q.trim()) return reviews;
    const key = q.trim().toLowerCase();
    return reviews.filter(
      (r) =>
        r.text.toLowerCase().includes(key) ||
        r.venue.toLowerCase().includes(key)
    );
  }, [q, reviews]);

  const clearSearch = () => {
    setQ("");
    setSearchOpen(false);
    router.setParams({ search: undefined as any });
  };

  const removeReview = (id: number) => {
    Alert.alert("삭제할까요?", "이 리뷰를 삭제합니다.", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => setReviews((prev) => prev.filter((r) => r.id !== id)),
      },
    ]);
  };

  const renderItem = ({ item }: { item: Review }) => (
    <View style={styles.card}>
      <Pressable
        hitSlop={8}
        onPress={() => removeReview(item.id)}
        style={styles.deleteBtnTop}
      >
        <XIcon size={15} color={Theme.colors.darkGray} />
      </Pressable>

      <Text style={styles.reviewText} numberOfLines={4}>
        {item.text}
      </Text>

      <View style={styles.cardBottom}>
        <View style={styles.venueRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.avatar ?? "🎵"}</Text>
          </View>
          <Text style={styles.venueName}>{item.venue}</Text>
        </View>
      </View>
    </View>
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
            placeholder="리뷰/공연장 검색"
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
            <Pressable onPress={clearSearch} hitSlop={10}>
              <Ionicons name="close" size={18} color="#bbb" />
            </Pressable>
          )}
        </View>
      )}

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>작성한 리뷰가 없어요</Text>
          </View>
        }
      />
      <View style={{ height: 12 }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.white },

  searchBarWrap: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    marginHorizontal: Theme.spacing.md,
    padding: Theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.white,
  },
  searchInput: {
    flex: 1,
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.black,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },

  card: {
    position: "relative",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
    borderRadius: 5,
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
  },

  deleteBtnTop: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 15,
    height: 15,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  reviewText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#111",
  },

  cardBottom: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  venueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
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
  venueName: { fontSize: 12, color: "#6b7280", fontWeight: "600" },

  emptyWrap: { alignItems: "center", paddingTop: 64 },
  emptyText: { color: "#9ca3af" },
});
