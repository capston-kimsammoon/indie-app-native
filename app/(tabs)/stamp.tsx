import React, { useMemo, useState, useEffect } from "react";
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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Theme from "@/constants/Theme";
import { Picker } from "@react-native-picker/picker";
import { Stamp as StampIcon } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";

type StampItem = { id: number; image: string; date: string }; 

export default function StampPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ search?: string }>();

  const [stamps] = useState<StampItem[]>([
    { id: 1, image: "https://picsum.photos/seed/stamp1/100", date: "2025.05.07" },
    { id: 2, image: "https://picsum.photos/seed/stamp2/100", date: "2025.11.08" },
    { id: 3, image: "https://picsum.photos/seed/stamp3/100", date: "2022.02.15" },
    { id: 4, image: "https://picsum.photos/seed/stamp4/100", date: "2024.01.07" },
    { id: 5, image: "https://picsum.photos/seed/stamp5/100", date: "2023.12.08" },
    { id: 6, image: "https://picsum.photos/seed/stamp6/100", date: "2021.06.15" },
    { id: 7, image: "https://picsum.photos/seed/stamp7/100", date: "2024.03.07" },
    { id: 8, image: "https://picsum.photos/seed/stamp8/100", date: "2023.11.08" },
    { id: 9, image: "https://picsum.photos/seed/stamp9/100", date: "2024.02.15" },
    { id: 10, image: "https://picsum.photos/seed/stamp10/100", date: "2025.05.07" },
    { id: 11, image: "https://picsum.photos/seed/stamp11/100", date: "2024.02.15" },
    { id: 12, image: "https://picsum.photos/seed/stamp12/100", date: "2025.11.08" },
    { id: 13, image: "https://picsum.photos/seed/stamp13/100", date: "2022.02.15" },
    { id: 14, image: "https://picsum.photos/seed/stamp14/100", date: "2024.01.07" },
    { id: 15, image: "https://picsum.photos/seed/stamp15/100", date: "2023.12.08" },
    { id: 16, image: "https://picsum.photos/seed/stamp16/100", date: "2021.06.15" },
    { id: 17, image: "https://picsum.photos/seed/stamp17/100", date: "2024.03.07" },
    { id: 18, image: "https://picsum.photos/seed/stamp18/100", date: "2023.11.08" },
    { id: 19, image: "https://picsum.photos/seed/stamp19/100", date: "2024.02.15" },
  ]);

  const now = new Date();

  const [startYear, setStartYear] = useState(now.getFullYear());
  const [startMonth, setStartMonth] = useState(1);
  const [endYear, setEndYear] = useState(now.getFullYear());
  const [endMonth, setEndMonth] = useState(now.getMonth() + 1);

  const [range, setRange] = useState<null | {
    startY: number; startM: number; endY: number; endM: number;
  }>(null);

  const [showRangeSheet, setShowRangeSheet] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (params?.search) setSearchOpen(true);
  }, [params?.search]);

  const clearSearch = () => {
    setQ("");
    setSearchOpen(false);
    router.setParams({ search: undefined as any });
  };

  const appliedLabel = useMemo(() => {
    if (!range) return "전체";
    const s = `${range.startY}.${range.startM}`;
    const e = `${range.endY}.${range.endM}`;
    return `${s} ~ ${e}`;
  }, [range]);

  const YEARS = useMemo(() => {
    const base = now.getFullYear();
    const arr: number[] = [];
    for (let y = base - 5; y <= base + 5; y++) arr.push(y);
    return arr;
  }, [now]);
  const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

  const toYM = (y: number, m: number) => y * 100 + m;

  const filteredStamps = useMemo(() => {
    let list = stamps;

    if (range) {
      const sYM = toYM(range.startY, range.startM);
      const eYM = toYM(range.endY, range.endM);
      list = list.filter(({ date }) => {
        const [yyStr, mmStr] = date.split(".");
        const yy = parseInt(yyStr, 10);
        const mm = parseInt(mmStr, 10);
        const ym = toYM(yy, mm);
        return sYM <= ym && ym <= eYM;
      });
    }

    if (q.trim()) {
      const key = q.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.date.toLowerCase().includes(key) ||
          String(s.id).includes(key)
      );
    }

    return list;
  }, [stamps, range, q]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 검색바 */}
      {searchOpen && (
        <View style={styles.searchBarWrap}>
          <Ionicons name="search" size={18} color="#888" />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="스탬프 검색"
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

      {/* 필터 */}
      <View style={styles.filterRow}>
        <Pressable style={styles.pill} onPress={() => setShowRangeSheet(true)} hitSlop={6}>
          <Text style={styles.pillText}>기간 설정</Text>
        </Pressable>
        <Text style={styles.appliedText}>{appliedLabel}</Text>
      </View>

      {/* 스탬프 리스트 */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredStamps.map((s) => (
          <View key={s.id} style={styles.stampItem}>
            <Image source={{ uri: s.image }} style={styles.stampImage} />
            <Text style={styles.stampDate}>{s.date}</Text>
          </View>
        ))}
        {filteredStamps.length === 0 && (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Text style={{ color: "#999" }}>스탬프가 없습니다</Text>
          </View>
        )}
      </ScrollView>

      {/* 플로팅 버튼 */}
      <Pressable style={styles.fab} onPress={() => router.push("/getstamp")}>
        <StampIcon size={24} color={Theme.colors.black} />
      </Pressable>

      {/* 기간 설정 바텀시트 */}
      <Modal
        visible={showRangeSheet}
        animationType="slide"
        transparent
        onRequestClose={() => setShowRangeSheet(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setShowRangeSheet(false)}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.sheetTitle}>기간 설정</Text>

              <View style={styles.pickersRow}>
                {/* 시작 */}
                <View style={styles.pickerBox}>
                  <Picker
                    selectedValue={startYear}
                    onValueChange={(v) => setStartYear(v as number)}
                    style={[styles.pickerWheel, styles.pickerYearCol]}
                    itemStyle={styles.pickerItem}
                  >
                    {YEARS.map((y) => (
                      <Picker.Item key={`sy-${y}`} label={`${y}`} value={y} />
                    ))}
                  </Picker>
                  <Picker
                    selectedValue={startMonth}
                    onValueChange={(v) => setStartMonth(v as number)}
                    style={[styles.pickerWheel, styles.pickerMonthCol]}
                    itemStyle={styles.pickerItem}
                  >
                    {MONTHS.map((m) => (
                      <Picker.Item key={`sm-${m}`} label={`${m}`} value={m} />
                    ))}
                  </Picker>
                </View>

                <Text>~</Text>
                <View style={styles.pickerBox}>
                  <Picker
                    selectedValue={endYear}
                    onValueChange={(v) => setEndYear(v as number)}
                    style={[styles.pickerWheel, styles.pickerYearCol]}
                    itemStyle={styles.pickerItem}
                  >
                    {YEARS.map((y) => (
                      <Picker.Item key={`ey-${y}`} label={`${y}`} value={y} />
                    ))}
                  </Picker>
                  <Picker
                    selectedValue={endMonth}
                    onValueChange={(v) => setEndMonth(v as number)}
                    style={[styles.pickerWheel, styles.pickerMonthCol]}
                    itemStyle={styles.pickerItem}
                  >
                    {MONTHS.map((m) => (
                      <Picker.Item key={`em-${m}`} label={`${m}`} value={m} />
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
                  onPress={() => {
                    let sY = startYear, sM = startMonth, eY = endYear, eM = endMonth;
                    if (toYM(sY, sM) > toYM(eY, eM)) {
                      [sY, eY] = [eY, sY];
                      [sM, eM] = [eM, sM];
                    }
                    setRange({ startY: sY, startM: sM, endY: eY, endM: eM });
                    setShowRangeSheet(false);
                  }}
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
  appliedText: { color: Theme.colors.darkGray, fontSize: Theme.fontSizes.xs, marginLeft: Theme.spacing.xs },

  scrollContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingVertical: Theme.spacing.lg,
    rowGap: Theme.spacing.lg,
  },
  stampItem: { alignItems: "center", width: "33%" },
  stampImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 6 },
  stampDate: { fontSize: Theme.fontSizes.xs, color: Theme.colors.darkGray },

  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
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
    paddingBottom: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E5E5EA",
    marginBottom: 8,
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
    gap: 8,
    paddingVertical: 4,
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
    marginHorizontal: 1,
    paddingHorizontal: 0,
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
    gap: 28,
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
  sheetApply: { backgroundColor: Theme.colors.themeOrange, borderColor: Theme.colors.themeOrange },
  sheetApplyText: { color: Theme.colors.white, fontWeight: Theme.fontWeights.semibold },
});
