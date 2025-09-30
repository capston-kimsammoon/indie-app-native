import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fetchAvailableStamps, collectStamp } from "@/Api/stampApi";
import Theme from "@/constants/Theme";
type Candidate = {
  id: number;          // performance id
  title: string;
  venue: string;
  date: string;        // YYYY.MM.DD
  posterUrl?: string;
};

function toYmd(dateLike?: string | number | Date) {
  if (!dateLike) return "-";
  const d = new Date(dateLike);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export default function GetStampPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ search?: string }>();

  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  const [items, setItems] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<Candidate | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (params?.search) setSearchOpen(true);
  }, [params?.search]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchAvailableStamps(3);
        const mapped: Candidate[] = (data || []).map((x: any) => ({
          id: x.performance_id ?? x.id,
          title: x.title,
          venue: x.venue,
          date: toYmd(x.date),
          posterUrl: x.posterUrl ?? x.venueImageUrl ?? undefined,
        }));
        setItems(mapped);
      } catch (e: any) {
        console.error(e);
        Alert.alert("오류", e?.message ?? "스탬프 후보를 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return items;
    return items.filter((e) => e.title.toLowerCase().includes(key));
  }, [q, items]);

  const clearSearch = () => {
    setQ("");
    setSearchOpen(false);
    router.setParams({ search: undefined as any });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {searchOpen && (
        <View style={styles.searchBarWrap}>
          <Ionicons name="search" size={18} color={Theme.colors.lightGray} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="리뷰/공연장 검색"
            placeholderTextColor={Theme.colors.lightGray}
            style={styles.searchInput}
            returnKeyType="search"
            autoFocus
          />
          {q.length > 0 ? (
            <Pressable onPress={() => setQ("")} hitSlop={10}>
              <Ionicons name="close-circle" size={Theme.iconSizes.sm} color={Theme.colors.lightGray} />
            </Pressable>
          ) : (
            <Pressable onPress={clearSearch} hitSlop={10}>
              <Ionicons name="close" size={Theme.iconSizes.sm} color={Theme.colors.lightGray} />
            </Pressable>
          )}
        </View>
      )}

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          numColumns={3}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => {
                setSelected(item);
                setShowConfirm(true);
              }}
            >
              <Image
                source={{
                  uri:
                    item.posterUrl ||
                    "https://dummyimage.com/300x420/eeeeee/aaaaaa&text=NO+IMAGE",
                }}
                style={styles.poster}
              />
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>해당하는 공연이 없어요</Text>
            </View>
          }
        />
      )}

      {/* 확인 모달 */}
      <Modal
        transparent
        visible={showConfirm}
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setShowConfirm(false)}>
          <TouchableWithoutFeedback>
            <View style={styles.modalBox}>
              <Text style={styles.modalText}>스탬프를 받으시겠습니까?</Text>
              <View style={styles.row}>
                <Pressable
                  style={[styles.btn, styles.ok]}
                  onPress={async () => {
                    try {
                      if (selected) {
                        await collectStamp(selected.id);
                        Alert.alert("완료", "스탬프를 수집했어요!");
                        router.push("/mystamp");
                      }
                    } catch (e: any) {
                      console.error(e);
                      Alert.alert("오류", e?.message ?? "스탬프 수집에 실패했어요.");
                    } finally {
                      setShowConfirm(false);
                    }
                  }}
                >
                  <Text style={styles.okText}>예</Text>
                </Pressable>
                <Pressable
                  style={[styles.btn, styles.cancel]}
                  onPress={() => setShowConfirm(false)}
                >
                  <Text style={styles.cancelText}>취소</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const GAP = Theme.spacing.md;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.white },

  searchBarWrap: {
    marginHorizontal: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.lightGray,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.sm,
    gap: Theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.white,
  },
  searchInput: { flex: 1, paddingVertical: 2, fontSize: Theme.fontSizes.sm, color: Theme.colors.black },

  list: { paddingHorizontal: Theme.spacing.md, paddingTop: Theme.spacing.md, paddingBottom: Theme.spacing.lg },
  column: { gap: GAP, marginBottom: GAP },
  card: { flex: 1, alignItems: "center", gap: Theme.spacing.sm },
  poster: { width: 100, height: 140, borderRadius: 8},
  cardTitle: { fontSize: Theme.fontSizes.xs, color: Theme.colors.black, maxWidth: 100 },

  emptyWrap: { alignItems: "center", paddingTop: 64 },
  emptyText: { color: Theme.colors.lightGray},

  backdrop: {
    flex: 1,
    backgroundColor: Theme.colors.gray,
    justifyContent: "center",
    alignItems: "center",
    padding: Theme.spacing.lg,
  },
  modalBox: {
    backgroundColor: Theme.colors.white,
    borderRadius: 12,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalText: { fontSize: 15, marginBottom: 16, color: Theme.colors.black },
  row: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, padding: 10, borderRadius: 8, alignItems: "center" },
  ok: { backgroundColor: Theme.colors.themeOrange },
  okText: { color: Theme.colors.white, fontWeight: Theme.fontWeights.semibold },
  cancel: { backgroundColor: Theme.colors.white },
  cancelText: { color: Theme.colors.darkGray, fontWeight:Theme.fontWeights.semibold },
});
