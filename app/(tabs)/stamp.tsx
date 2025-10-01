// app/stamp/index.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Modal,
  Platform,
  TouchableWithoutFeedback,
  TextInput,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Theme from "@/constants/Theme";
import { Picker } from "@react-native-picker/picker";
import { Stamp as StampIcon } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchCollectedStamps} from "@/api/stampApi"

type UIStamp = { id: number; image: string; date: string };

type ServerStamp = {
  id: number;
  performance?: {
    image_url?: string | null;
    date?: string | null;
  } | null;
};

const toDotDate = (s?: string | null): string => {
  if (!s) return "-";
  const d = s.split("T", 1)[0];
  return d.replace(/-/g, ".");
};
export default function StampPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const search =
    typeof params.search === 'string' ? params.search : undefined;
  const now = new Date();

  // 기간(연/월)
  const [startYear, setStartYear] = useState(now.getFullYear());
  const [startMonth, setStartMonth] = useState(1);
  const [endYear, setEndYear] = useState(now.getFullYear());
  const [endMonth, setEndMonth] = useState(now.getMonth() + 1);
  const [range, setRange] = useState<null | {
    startY: number;
    startM: number;
    endY: number;
    endM: number;
  }>(null);

  // 바텀시트 모달
  const [showRangeSheet, setShowRangeSheet] = useState(false);

  // 검색
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  // 로딩/리프레시/에러
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 서버 스탬프
  const [serverStamps, setServerStamps] = useState<ServerStamp[]>([]);

  useEffect(() => {
    if (params?.search) setSearchOpen(true);
  }, [params?.search]);

  const YEARS = useMemo(() => {
    const base = now.getFullYear();
    return Array.from({ length: 11 }, (_, i) => base - 5 + i);
  }, [now]);
  const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

  const appliedLabel = useMemo(() => {
    if (!range) return "전체";
    return `${range.startY}.${range.startM} ~ ${range.endY}.${range.endM}`;
  }, [range]);

  // 서버 호출 (연/월 모두 전달)
  const load = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const query = range
          ? {
              startMonth: range.startM,
              endMonth: range.endM,
              startYear: range.startY,
              endYear: range.endY,
            }
          : undefined;

        const list = await fetchCollectedStamps(query);
        setServerStamps(list as ServerStamp[]);
      } catch (e: any) {
        setError(e?.message ?? "스탬프를 불러오지 못했어요.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [range]
  );

  useEffect(() => {
    load();
  }, [load]);

  // UI 변환 (날짜만 표기)
  const uiStamps: UIStamp[] = useMemo(() => {
    const base: UIStamp[] =
      (serverStamps || []).map((s) => ({
        id: s.id,
        image:
          s.performance?.image_url ??
          "https://dummyimage.com/100x100/eeeeee/aaaaaa&text=NO+IMG",
        date: toDotDate(s.performance?.date),
      })) ?? [];

    const key = q.trim().toLowerCase();
    if (!key) return base;
    return base.filter(
      (s) => s.date.toLowerCase().includes(key) || String(s.id).includes(key)
    );
  }, [serverStamps, q]);

  const clearSearch = () => {
    setQ("");
    setSearchOpen(false);
    router.setParams({ search: undefined as any });
  };

  // 기간 적용
  const applyRange = () => {
    let sY = startYear,
      sM = startMonth,
      eY = endYear,
      eM = endMonth;
    const toYM = (y: number, m: number) => y * 100 + m;
    if (toYM(sY, sM) > toYM(eY, eM)) {
      [sY, eY] = [eY, sY];
      [sM, eM] = [eM, sM];
    }
    setRange({ startY: sY, startM: sM, endY: eY, endM: eM });
    setShowRangeSheet(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 검색바 */}
      {searchOpen && (
        <View style={styles.searchBarWrap}>
          <Ionicons name="search" size={Theme.iconSizes.sm} color={Theme.colors.gray} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="스탬프 검색"
            placeholderTextColor={Theme.colors.gray}
            style={styles.searchInput}
            returnKeyType="search"
            autoFocus
          />
          {q.length > 0 ? (
            <Pressable onPress={() => setQ("")} hitSlop={10}>
              <Ionicons name="close-circle" size={Theme.iconSizes.sm} color={Theme.colors.gray} />
            </Pressable>
          ) : (
            <Pressable onPress={clearSearch} hitSlop={10}>
              <Ionicons name="close" size={Theme.iconSizes.sm} color={Theme.colors.gray} />
            </Pressable>
          )}
        </View>
      )}

      {/* 필터: 모달 트리거 */}
      <View style={styles.filterRow}>
        <Pressable
          style={styles.pill}
          onPress={() => setShowRangeSheet(true)}
          hitSlop={6}
        >
          <Text style={styles.pillText}>기간 설정</Text>
        </Pressable>
        <Text style={styles.appliedText}>{appliedLabel}</Text>
      </View>

      {/* 본문 */}
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, color: Theme.colors.darkGray }}>불러오는 중…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
          }
        >
          {error && <Text style={{ color: Theme.colors.themeOrange, marginBottom: Theme.spacing.md }}>{error}</Text>}

          {uiStamps.map((s) => (
            <View key={s.id} style={styles.stampItem}>
              <Image source={{ uri: s.image }} style={styles.stampImage} />
              <Text style={styles.stampDate}>{s.date}</Text>
            </View>
          ))}

          {uiStamps.length === 0 && !error && (
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Text style={{ color: Theme.colors.gray }}>스탬프가 없습니다</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* 스탬프 받기 */}
      <Pressable style={styles.fab} onPress={() => router.push("/getstamp")}>
        <StampIcon size={Theme.iconSizes.lg} color={Theme.colors.black} />
      </Pressable>

      {/* 바텀시트 모달 */}
      <Modal
        visible={showRangeSheet}
        animationType="slide"
        transparent
        onRequestClose={() => setShowRangeSheet(false)}
      >
        <Pressable
          style={styles.sheetBackdrop}
          onPress={() => setShowRangeSheet(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.sheetTitle}>기간 설정</Text>

              <View style={styles.pickersRow}>
                {/* 시작 */}
                <View style={styles.pickerBox}>
                  <Picker
                    selectedValue={String(startYear)}
                    onValueChange={(v) => setStartYear(parseInt(String(v), 10))}
                    style={[styles.pickerWheel, styles.pickerYearCol]}
                    itemStyle={styles.pickerItem}
                  >
                    {YEARS.map((y) => (
                      <Picker.Item key={`sy-${y}`} label={`${y}`} value={`${y}`} />
                    ))}
                  </Picker>
                  <Picker
                    selectedValue={String(startMonth)}
                    onValueChange={(v) => setStartMonth(parseInt(String(v), 10))}
                    style={[styles.pickerWheel, styles.pickerMonthCol]}
                    itemStyle={styles.pickerItem}
                  >
                    {MONTHS.map((m) => (
                      <Picker.Item key={`sm-${m}`} label={`${m}`} value={`${m}`} />
                    ))}
                  </Picker>
                </View>

                <Text>~</Text>

                {/* 끝 */}
                <View style={styles.pickerBox}>
                  <Picker
                    selectedValue={String(endYear)}
                    onValueChange={(v) => setEndYear(parseInt(String(v), 10))}
                    style={[styles.pickerWheel, styles.pickerYearCol]}
                    itemStyle={styles.pickerItem}
                  >
                    {YEARS.map((y) => (
                      <Picker.Item key={`ey-${y}`} label={`${y}`} value={`${y}`} />
                    ))}
                  </Picker>
                  <Picker
                    selectedValue={String(endMonth)}
                    onValueChange={(v) => setEndMonth(parseInt(String(v), 10))}
                    style={[styles.pickerWheel, styles.pickerMonthCol]}
                    itemStyle={styles.pickerItem}
                  >
                    {MONTHS.map((m) => (
                      <Picker.Item key={`em-${m}`} label={`${m}`} value={`${m}`} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.sheetButtons}>
                <Pressable
                  style={[styles.sheetBtn, styles.sheetCancel]}
                  onPress={() => setShowRangeSheet(false)}
                >
                  <Text style={styles.sheetCancelText}>취소</Text>
                </Pressable>
                <Pressable
                  style={[styles.sheetBtn, styles.sheetApply]}
                  onPress={applyRange}
                >
                  <Text style={styles.sheetApplyText}>적용</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.white },

  // 검색바
  searchBarWrap: {
    marginHorizontal: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
    borderRadius: Theme.spacing.md,
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

  // 필터 행
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
  },
  pill: {
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    paddingHorizontal: Theme.spacing.sm,
    height: 24,
    borderRadius: 15,
    justifyContent: "center",
  },
  pillText: { color: Theme.colors.darkGray, fontSize: Theme.fontSizes.xs },
  appliedText: {
    color: Theme.colors.darkGray,
    fontSize: Theme.fontSizes.xs,
    marginLeft: Theme.spacing.xs,
  },

  // 리스트
  scrollContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingVertical: Theme.spacing.lg,
    rowGap: Theme.spacing.lg,
  },
  stampItem: { alignItems: "center", width: "33%" },
  stampImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: Theme.spacing.sm,
    backgroundColor: Theme.colors.white,
  },
  stampDate: { fontSize: Theme.fontSizes.xs, color: Theme.colors.darkGray },

  // FAB
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.themeOrange,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    zIndex: 10,
    shadowColor: Theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  // Bottom Sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: Theme.colors.shadow,
    justifyContent: "flex-end",
  },
  sheet: {
    alignSelf: "stretch",
    backgroundColor: Theme.colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    maxHeight: 380,
    minHeight: 260,
    paddingBottom: Theme.spacing.md,
    elevation: 8,
    shadowColor: Theme.colors.black,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: Theme.colors.white,
    marginBottom: Theme.spacing.sm,
  },
  sheetTitle: {
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.bold,
    marginBottom: Theme.spacing.sm,
  },
  pickersRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    maxHeight: 220,
  },
  pickerBox: {
    flex: 1,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    borderRadius: 12,
    backgroundColor: Theme.colors.white,
    overflow: "hidden",
  },
  pickerWheel: { flex: 1 },
  pickerYearCol: { flex: 6 },
  pickerMonthCol: { flex: 5 },
  pickerItem: {
    textAlign: "center",
    fontSize: Platform.OS === "ios" ? 12 : Theme.fontSizes.base,
  },
  sheetButtons: {
    flexDirection: "row",
    gap: Theme.spacing.lg,
    marginTop: Theme.spacing.md,
  },
  sheetBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  sheetCancel: { borderColor: Theme.colors.lightGray },
  sheetCancelText: { color: Theme.colors.darkGray },
  sheetApply: {
    backgroundColor: Theme.colors.themeOrange,
    borderColor: Theme.colors.themeOrange,
  },
  sheetApplyText: {
    color: Theme.colors.white,
    fontWeight: Theme.fontWeights.semibold,
  },
});
