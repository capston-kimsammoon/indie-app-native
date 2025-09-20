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
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type EventItem = {
  id: number;
  title: string;
  venue: string;
  date: string;
  posterUrl: string;
};

const EVENTS: EventItem[] = [
  { 
    id: 101, 
    title: "언드", 
    venue: "롤링홀", 
    date: "2025.09.20", 
    posterUrl: "https://picsum.photos/seed/e1/300/420" 
  },
  { 
    id: 102, 
    title: "인터플레이", 
    venue: "클럽 빅토리", 
    date: "2025.10.02", 
    posterUrl: "https://picsum.photos/seed/e2/300/420" 
  },
  { 
    id: 103, 
    title: "고요의 밤", 
    venue: "프리즘홀", 
    date: "2025.11.15", 
    posterUrl: "https://picsum.photos/seed/e3/300/420" 
  },
  { 
    id: 104, 
    title: "여름, 피랑", 
    venue: "CJ 아지트 광흥창", 
    date: "2025.07.07", 
    posterUrl: "https://picsum.photos/seed/e4/300/420" 
  },
  { 
    id: 105, 
    title: "인플레코드 대전", 
    venue: "홍대 브이홀", 
    date: "2025.12.01", 
    posterUrl: "https://picsum.photos/seed/e5/300/420" 
  },
  { 
    id: 106, 
    title: "월광 소나타", 
    venue: "세종문화회관 체임버홀", 
    date: "2025.09.28", 
    posterUrl: "https://picsum.photos/seed/e6/300/420" 
  },
];


export default function GetStampPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ search?: string }>();

  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (params?.search) setSearchOpen(true);
  }, [params?.search]);

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return EVENTS;
    return EVENTS.filter((e) => e.title.toLowerCase().includes(key));
  }, [q]);

  const clearSearch = () => {
    setQ("");
    setSearchOpen(false);
    router.setParams({ search: undefined as any });
  };

  const [selected, setSelected] = useState<EventItem | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

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

      {/* 목록 */}
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
            <Image source={{ uri: item.posterUrl }} style={styles.poster} />
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
                  onPress={() => {
                    if (selected) {
                      const newStamp = {
                        id: selected.id,
                        image: selected.posterUrl,
                        date: new Date().toISOString().slice(0, 10).replace(/-/g, "."),
                      };
                      router.push({
                        pathname: "/stamp",
                        params: { newStamp: JSON.stringify(newStamp) },
                      });
                    }
                    setShowConfirm(false);
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

const GAP = 12;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  searchBarWrap: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e5e5",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 2,
    fontSize: 14,
    color: "#111",
  },

  list: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 24 },
  column: { gap: GAP, marginBottom: GAP },
  card: { flex: 1, alignItems: "center", gap: 6 },
  poster: { width: 100, height: 140, borderRadius: 8, backgroundColor: "#eee" },
  cardTitle: { fontSize: 12, color: "#333", maxWidth: 100 },

  emptyWrap: { alignItems: "center", paddingTop: 64 },
  emptyText: { color: "#9ca3af" },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalText: { fontSize: 15, marginBottom: 16, color: "#111" },
  row: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, padding: 10, borderRadius: 8, alignItems: "center" },
  ok: { backgroundColor: "#2E7D32" },
  okText: { color: "#fff", fontWeight: "600" },
  cancel: { backgroundColor: "#eee" },
  cancelText: { color: "#333", fontWeight: "600" },
});
