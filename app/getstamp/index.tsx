// //app/getstamp/index.tsx
// import React, { useEffect, useState, useMemo } from "react";
// import {
//   SafeAreaView,
//   StatusBar,
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   Pressable,
//   Modal,
//   TouchableWithoutFeedback,
//   ActivityIndicator,
//   Alert,
//   SectionList,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { fetchAvailableStamps, collectStamp } from "@/api/StampApi";
// import Theme from "@/constants/Theme";

// type Candidate = {
//   id: number;
//   title: string;
//   venue: string;
//   /** ISO or date-like */
//   dateRaw: string | number | Date;
//   /** UI 표현용 */
//   date: string; // "YYYY.MM.DD"
//   posterUrl?: string;
// };

// type ListItem = Candidate | { id: string; isEmpty: true };

// function toYmd(dateLike?: string | number | Date) {
//   if (!dateLike) return "-";
//   const d = new Date(dateLike);
//   const y = d.getFullYear();
//   const m = `${d.getMonth() + 1}`.padStart(2, "0");
//   const day = `${d.getDate()}`.padStart(2, "0");
//   return `${y}.${m}.${day}`;
// }

// /** 이미 받은 스탬프 에러인지 판별 (400 + 메시지/코드 키워드) */
// function isAlreadyCollectedError(err: any) {
//   const res = err?.response;
//   if (!res) return false;
//   const status = Number(res.status);
//   const data = res.data || {};
//   const code = String(data.code ?? data.errorCode ?? data.error_code ?? "").toUpperCase();
//   const msg = String(data.message ?? data.detail ?? data.error ?? "").toLowerCase();
//   return (
//     status === 400 &&
//     (code.includes("ALREADY") ||
//       msg.includes("already") ||
//       msg.includes("exists") ||
//       msg.includes("중복") ||
//       msg.includes("이미"))
//   );
// }

// /** 섹션 타입: 각 섹션 data는 '행' 단위(최대 3개 카드) */
// type SectionRow = Candidate[];
// type Section = { title: string; key: string; data: SectionRow[] };

// export default function GetStampPage() {
//   const router = useRouter();

//   const [items, setItems] = useState<Candidate[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selected, setSelected] = useState<Candidate | null>(null);
//   const [showConfirm, setShowConfirm] = useState(false);

//   const GAP = Theme.spacing.md;
//   const NUM_COLUMNS = 3;

//   // 목록 로더
//   const loadAvailable = async () => {
//     try {
//       setLoading(true);
//       const data = await fetchAvailableStamps(3);
//       const mapped: Candidate[] = (data || []).map((x: any) => ({
//         id: x.performance_id ?? x.id,
//         title: x.title,
//         venue: x.venue,
//         dateRaw: x.date,
//         date: toYmd(x.date),
//         posterUrl: x.posterUrl ?? x.venueImageUrl ?? undefined,
//       }));
//       setItems(mapped);
//     } catch (e: any) {
//       console.error(e);
//       Alert.alert("오류", e?.message ?? "스탬프 후보를 불러오지 못했어요.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadAvailable();
//   }, []);

// <<<<<<< HEAD
//   // 빈 아이템을 추가하여 왼쪽 정렬 유지
//   const displayItems: ListItem[] = useMemo(() => {
//     const result: ListItem[] = [...items];
//     const remainder = items.length % NUM_COLUMNS;
//     if (remainder !== 0) {
//       const emptyCount = NUM_COLUMNS - remainder;
//       for (let i = 0; i < emptyCount; i++) {
//         result.push({ id: `empty-${i}`, isEmpty: true });
//       }
//     }
//     return result;
//   }, [items, NUM_COLUMNS]);
// =======
//   /** 날짜별 그룹 → 섹션 리스트 (행 단위로 chunk) */
//   const sections: Section[] = useMemo(() => {
//     const groups = new Map<string, Candidate[]>();
//     for (const it of items) {
//       const k = toKey(it.dateRaw);
//       if (!groups.has(k)) groups.set(k, []);
//       groups.get(k)!.push(it);
//     }

//     // 날짜 오름차순 정렬(원하면 desc로 바꿔도 OK)
//     const keys = Array.from(groups.keys()).sort();

//     const chunk = (arr: Candidate[], size: number): SectionRow[] => {
//       const out: SectionRow[] = [];
//       for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
//       return out;
//     };

//     return keys.map((k) => {
//       const arr = groups.get(k) ?? [];
//       // 같은 날짜 내에서는 제목 기준 정렬(원하면 다른 기준으로)
//       arr.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
//       const rows = chunk(arr, NUM_COLUMNS);
//       return {
//         key: k,
//         title: toKoreanDateLabel(k),
//         data: rows,
//       };
//     });
//   }, [items]);

//   const renderCard = (item: Candidate) => (
//     <Pressable
//       key={item.id}
//       style={{ flex: 1, marginHorizontal: GAP / 2, alignItems: "center" }}
//       onPress={() => {
//         setSelected(item);
//         setShowConfirm(true);
//       }}
//     >
//       <Image
//         source={item.posterUrl ? { uri: item.posterUrl } : require("@/assets/images/modie-sample.png")}
//         style={styles.poster}
//       />
//       <Text
//         style={styles.title}
//         numberOfLines={1}
//         ellipsizeMode="tail"
//       >
//         {item.title}
//       </Text>
//     </Pressable>
//   );
// >>>>>>> upstream/main

//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar barStyle="dark-content" />

//       {loading ? (
//         <View style={styles.center}>
//           <ActivityIndicator />
//         </View>
//       ) : (
// <<<<<<< HEAD
//         <FlatList
//           data={displayItems}
//           keyExtractor={(item) => String(item.id)}
//           numColumns={NUM_COLUMNS}
//           columnWrapperStyle={{
//             justifyContent: "flex-start",
//             marginBottom: GAP,
//           }}
// =======
//         <SectionList
//           sections={sections}
//           keyExtractor={(_, index) => `row-${index}`}
// >>>>>>> upstream/main
//           contentContainerStyle={{
//             paddingHorizontal: GAP / 2,
//             paddingTop: GAP,
//             paddingBottom: GAP,
//           }}
// <<<<<<< HEAD
//           renderItem={({ item }) => {
//             // 빈 아이템은 투명하게 렌더링
//             if ('isEmpty' in item && item.isEmpty) {
//               return (
//                 <View
//                   style={{
//                     flex: 1,
//                     marginHorizontal: GAP / 2,
//                     marginBottom: GAP,
//                   }}
//                 />
//               );
//             }

//             const candidate = item as Candidate;
//             return (
//               <Pressable
//                 style={{
//                   flex: 1,
//                   marginHorizontal: GAP / 2,
//                   marginBottom: GAP,
//                   alignItems: "center",
//                 }}
//                 onPress={() => {
//                   setSelected(candidate);
//                   setShowConfirm(true);
//                 }}
//               >
//                 <Image
//                   source={candidate.posterUrl ? { uri: candidate.posterUrl } : require('@/assets/images/modie-sample.png')}
//                   style={{
//                     width: 100,
//                     height: 140,
//                     borderRadius: 8,
//                     borderWidth: 1,
//                     borderColor: Theme.colors.lightGray,
//                   }}
//                 />
//                 <Text
//                   style={{
//                     fontSize: Theme.fontSizes.sm,
//                     fontWeight: Theme.fontWeights.medium,
//                     color: Theme.colors.black,
//                     maxWidth: 100,
//                     textAlign: "center",
//                     marginTop: Theme.spacing.sm,
//                   }}
//                   numberOfLines={1}
//                   ellipsizeMode="tail"
//                 >
//                   {candidate.title}
//                 </Text>
//               </Pressable>
//             );
//           }}
// =======
//           renderSectionHeader={({ section }) => (
//             <Text style={styles.sectionHeader}>{section.title}</Text>
//           )}
//           renderItem={({ item: row }) => (
//             <View
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "flex-start",
//                 marginBottom: GAP,
//               }}
//             >
//               {/* 행 안에 카드들 */}
//               {row.map(renderCard)}
//               {/* 3열 정렬을 위해 빈 공간 채우기 */}
//               {row.length < NUM_COLUMNS &&
//                 Array.from({ length: NUM_COLUMNS - row.length }).map((_, i) => (
//                   <View key={`spacer-${i}`} style={{ flex: 1, marginHorizontal: GAP / 2 }} />
//                 ))}
//             </View>
//           )}
//           stickySectionHeadersEnabled
// >>>>>>> upstream/main
//         />
//       )}

//       {/* 확인 모달 */}
//       <Modal
//         transparent
//         visible={showConfirm}
//         animationType="fade"
//         onRequestClose={() => setShowConfirm(false)}
//       >
//         <Pressable style={styles.backdrop} onPress={() => setShowConfirm(false)}>
//           <TouchableWithoutFeedback>
//             <View style={styles.modalBox}>
//               <Text style={styles.modalText}>스탬프를 받으시겠습니까?</Text>
//               <View style={styles.row}>
//                 <Pressable
//                   style={[styles.btn, styles.ok]}
//                   onPress={async () => {
//                     try {
//                       if (selected) {
//                         await collectStamp(selected.id);
//                         setShowConfirm(false);
//                         Alert.alert(
//                           "스탬프 수집 완료",
//                           `${selected.title} 공연의 스탬프를 받았어요!`,
//                           [
// <<<<<<< HEAD
//                             { text: "스탬프 리스트 이동", onPress: () => router.push("/stamp") },
//                             { text: "닫기", style: "cancel" }
// =======
//                             { text: "스탬프 리스트 이동", onPress: () => router.push("/mystamp") },
//                             { text: "닫기", style: "cancel" },
// >>>>>>> upstream/main
//                           ]
//                         );
//                         // 필요하면 새로고침:
//                         // await loadAvailable();
//                       }
//                     } catch (e: any) {
//                       console.error(e);
//                       setShowConfirm(false);
//                       if (isAlreadyCollectedError(e)) {
//                         Alert.alert(
//                           "이미 받은 스탬프",
//                           `${selected?.title ?? ""} 공연 스탬프는 이미 수집되었습니다.`
//                         );
//                       } else {
//                         Alert.alert("오류", e?.message ?? "스탬프 수집에 실패했어요.");
//                       }
//                     }
//                   }}
//                 >
//                   <Text style={styles.okText}>예</Text>
//                 </Pressable>
//                 <Pressable style={[styles.btn, styles.cancel]} onPress={() => setShowConfirm(false)}>
//                   <Text style={styles.cancelText}>취소</Text>
//                 </Pressable>
//               </View>
//             </View>
//           </TouchableWithoutFeedback>
//         </Pressable>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: Theme.colors.white },
//   center: { flex: 1, alignItems: "center", justifyContent: "center" },

//   sectionHeader: {
//     fontSize: 20,
//     fontWeight: Theme.fontWeights.bold,
//     color: Theme.colors.darkGray,
//     marginBottom: 8,
//     marginLeft: 4,
//   },

//   poster: {
//     width: 100,
//     height: 140,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: Theme.colors.lightGray,
//   },
//   title: {
//     fontSize: Theme.fontSizes.sm,
//     fontWeight: Theme.fontWeights.medium,
//     color: Theme.colors.black,
//     maxWidth: 100,
//     textAlign: "center",
//     marginTop: Theme.spacing.sm,
//   },

//   backdrop: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: Theme.spacing.lg,
//   },
//   modalBox: {
//     backgroundColor: Theme.colors.white,
//     borderRadius: 12,
//     padding: 20,
//     width: "80%",
//     alignItems: "center",
//   },
//   modalText: { fontSize: 15, marginBottom: 16, color: Theme.colors.black },
//   row: { flexDirection: "row", gap: 10 },
//   btn: { flex: 1, padding: 10, borderRadius: 8, alignItems: "center" },
//   ok: { backgroundColor: Theme.colors.themeOrange },
//   okText: { color: Theme.colors.white, fontWeight: Theme.fontWeights.semibold },
//   cancel: { backgroundColor: Theme.colors.lightGray },
//   cancelText: { color: Theme.colors.darkGray, fontWeight: Theme.fontWeights.semibold },
// });
