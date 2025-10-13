//app/getstamp/index.tsx
import React, { useEffect, useState, useMemo } from "react";
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
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { fetchAvailableStamps, collectStamp } from "@/api/StampApi";
import Theme from "@/constants/Theme";

type Candidate = {
  id: number;
  title: string;
  venue: string;
  date: string;
  posterUrl?: string;
};

type ListItem = Candidate | { id: string; isEmpty: true };

function toYmd(dateLike?: string | number | Date) {
  if (!dateLike) return "-";
  const d = new Date(dateLike);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}.${m}.${day}`;
}

/** 이미 받은 스탬프 에러인지 판별 (400 + 메시지/코드 키워드) */
function isAlreadyCollectedError(err: any) {
  const res = err?.response;
  if (!res) return false;
  const status = Number(res.status);
  const data = res.data || {};
  const code = String(data.code ?? data.errorCode ?? data.error_code ?? "").toUpperCase();
  const msg = String(data.message ?? data.detail ?? data.error ?? "").toLowerCase();
  return (
    status === 400 &&
    (
      code.includes("ALREADY") ||
      msg.includes("already") ||
      msg.includes("exists") ||
      msg.includes("중복") ||
      msg.includes("이미")
    )
  );
}

export default function GetStampPage() {
  const router = useRouter();

  const [items, setItems] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const GAP = Theme.spacing.md;
  const NUM_COLUMNS = 3;

  // 목록 로더 분리 (원하면 성공/취소 후 리프레시에도 재사용)
  const loadAvailable = async () => {
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
  };

  useEffect(() => {
    loadAvailable();
  }, []);

  // 빈 아이템을 추가하여 왼쪽 정렬 유지
  const displayItems: ListItem[] = useMemo(() => {
    const result: ListItem[] = [...items];
    const remainder = items.length % NUM_COLUMNS;
    if (remainder !== 0) {
      const emptyCount = NUM_COLUMNS - remainder;
      for (let i = 0; i < emptyCount; i++) {
        result.push({ id: `empty-${i}`, isEmpty: true });
      }
    }
    return result;
  }, [items, NUM_COLUMNS]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={displayItems}
          keyExtractor={(item) => String(item.id)}
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={{
            justifyContent: "flex-start",
            marginBottom: GAP,
          }}
          contentContainerStyle={{
            paddingHorizontal: GAP / 2,
            paddingTop: GAP,
            paddingBottom: GAP,
          }}
          renderItem={({ item }) => {
            // 빈 아이템은 투명하게 렌더링
            if ('isEmpty' in item && item.isEmpty) {
              return (
                <View
                  style={{
                    flex: 1,
                    marginHorizontal: GAP / 2,
                    marginBottom: GAP,
                  }}
                />
              );
            }

            const candidate = item as Candidate;
            return (
              <Pressable
                style={{
                  flex: 1,
                  marginHorizontal: GAP / 2,
                  marginBottom: GAP,
                  alignItems: "center",
                }}
                onPress={() => {
                  setSelected(candidate);
                  setShowConfirm(true);
                }}
              >
                <Image
                  source={candidate.posterUrl ? { uri: candidate.posterUrl } : require('@/assets/images/modie-sample.png')}
                  style={{
                    width: 100,
                    height: 140,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: Theme.colors.lightGray,
                  }}
                />
                <Text
                  style={{
                    fontSize: Theme.fontSizes.sm,
                    fontWeight: Theme.fontWeights.medium,
                    color: Theme.colors.black,
                    maxWidth: 100,
                    textAlign: "center",
                    marginTop: Theme.spacing.sm,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {candidate.title}
                </Text>
              </Pressable>
            );
          }}
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
                        setShowConfirm(false);
                        Alert.alert(
                          "스탬프 수집 완료",
                          `${selected.title} 공연의 스탬프를 받았어요!`,
                          [
                            { text: "스탬프 리스트 이동", onPress: () => router.push("/stamp") },
                            { text: "닫기", style: "cancel" }
                          ]
                        );
                        // 필요 시 목록 리프레시
                        // await loadAvailable();
                      }
                    } catch (e: any) {
                      console.error(e);
                      setShowConfirm(false);
                      if (isAlreadyCollectedError(e)) {
                        Alert.alert(
                          "이미 받은 스탬프",
                          `${selected?.title ?? ""} 공연 스탬프는 이미 수집되었습니다.`
                        );
                      } else {
                        Alert.alert("오류", e?.message ?? "스탬프 수집에 실패했어요.");
                      }
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.white },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
  cancel: { backgroundColor: Theme.colors.lightGray },
  cancelText: { color: Theme.colors.darkGray, fontWeight: Theme.fontWeights.semibold },
});
