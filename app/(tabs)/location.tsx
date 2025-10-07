// import React, { useMemo, useState, useEffect, useRef } from 'react';
// import {
//   View, Text, StyleSheet, FlatList, Pressable, Image,
//   StatusBar, Platform, TextInput, Alert
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import * as Location from 'expo-location';
// import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
// import IcMarker from "@/assets/icons/ic-marker.svg";
// import IcMylocation from '@/assets/icons/ic-mylocation.svg';
// import { formatTime, getNowTime } from '@/utils/dateUtils';
// import PerformanceCard from '@/components/cards/PerformanceCard';

// //import CurrentTimeText from './venue/CurrentTimeText';
// import MapWideSelectCard from './venue/MapWideSelectCard';

// import Theme from '@/constants/Theme';
// import { fetchNearbyVenues, fetchUpcomingPerformancesByVenue, fetchVenueListFlex, } from '@/api/NearbyApi';

// import { fetchVenueDetail } from '@/api/VenueApi';

// /** ===================== 상수 ===================== */
// const RADIUS_KM = 3;
// const FALLBACK_CENTER = { lat: 37.5533, lng: 126.9232 };
// const DEFAULT_PAGE_SIZE = 200;
// const PIN_COLOR = Theme.colors.themeOrange;
// const PIN_COLOR_SELECTED = Theme.colors.themeOrange;

// /** ============== 타입 ============== */
// export type Performance = {
//   id?: number;
//   title?: string;
//   date?: string;
//   time?: string;
//   image_url?: string;
//   address?: string;
// };

// export type Venue = {
//   venue_id: number;
//   name: string;
//   address?: string;
//   latitude: number;
//   longitude: number;
//   thumbnail?: string;
//   upcomingPerformance?: Performance[];
// };

// type BoundsPt = { lat: number; lng: number };
// type Bounds = { ne: BoundsPt; sw: BoundsPt };

// type RenderRow = { kind: 'row'; items: Venue[] };
// type RenderWide = { kind: 'wide'; venue: Venue };
// type RenderItem = RenderRow | RenderWide;

// const addrCache = new Map<number, string>();

// /** ===================== 유틸 ===================== */
// async function promisePool<T>(tasks: (() => Promise<T>)[], size = 3) {
//   const out: T[] = [];
//   let i = 0;
//   await Promise.all(
//     Array.from({ length: Math.min(size, tasks.length) }).map(async () => {
//       while (i < tasks.length) {
//         const cur = tasks[i++];
//         out.push(await cur());
//       }
//     })
//   );
//   return out;
// }

// const toNaiveIso = (d: Date) => {
//   const pad = (n: number) => String(n).padStart(2, '0');
//   const y = d.getFullYear();
//   const m = pad(d.getMonth() + 1);
//   const day = pad(d.getDate());
//   const hh = pad(d.getHours());
//   const mm = pad(d.getMinutes());
//   const ss = pad(d.getSeconds());
//   return `${y}-${m}-${day}T${hh}:${mm}:${ss}`;
// };

// async function fetchVenueDetailSafe(venueId: number) {
//   try {
//     const detail: any = await fetchVenueDetail(venueId);
//     return detail || {};
//   } catch {
//     return {};
//   }
// }

// async function enrichVenuesWithDetail(venueList: Venue[]) {
//   const targets = venueList.filter(
//     v => !v.address || !v.latitude || !v.longitude || !v.thumbnail
//   );

//   await promisePool(
//     targets.map(v => async () => {
//       const d = await fetchVenueDetailSafe(v.venue_id);
//       if (typeof d.address === 'string') addrCache.set(v.venue_id, d.address);

//       v.address = v.address ?? d.address ?? undefined;
//       v.latitude = v.latitude ?? d.location?.latitude ?? v.latitude;
//       v.longitude = v.longitude ?? d.location?.longitude ?? v.longitude;
//       v.thumbnail = v.thumbnail ?? d.image_url ?? v.thumbnail;

//       const first = d?.upcoming_performances?.items?.[0]
//         ?? d?.upcomingPerformances?.[0];
//       if (first && !v.upcomingPerformance?.length) {
//         v.upcomingPerformance = [first];
//       }
//     }),
//     3
//   );

//   return venueList.map(v => (v.address ? v : { ...v, address: addrCache.get(v.venue_id) }));
// }

// /** ===================== MapPage ===================== */
// export default function MapPage() {
//   const router = useRouter();
//   const params = useLocalSearchParams<{ search?: string | string[] }>();

//   const [venues, setVenues] = useState<Venue[]>([]);
//   const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
//   const [searchOpen, setSearchOpen] = useState<boolean>(false);
//   const [q, setQ] = useState<string>('');
//   const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(FALLBACK_CENTER);
//   const [mapZoom, setMapZoom] = useState<number>(13);
//   const [mapBounds, setMapBounds] = useState<Bounds | null>(null);

//   const listRef = useRef<FlatList<RenderItem>>(null);

//   /** ============== 데이터 로딩 함수 ============== */
//   const normalizeVenues = (data: any[]): Venue[] =>
//     (data || []).map((v: any) => ({
//       ...v,
//       venue_id: v.venue_id ?? v.id,
//       name: v.name ?? v.title ?? '',
//       latitude: v.latitude ?? v.lat,
//       longitude: v.longitude ?? v.lng ?? v.lon,
//       thumbnail: v.thumbnail ?? v.image_url ?? v.poster ?? v.cover,
//       address: v.address ?? v.road_address ?? v.roadAddress ?? v.addr ?? undefined,
//       upcomingPerformance: v.upcomingPerformance ?? v.performances ?? v.upcoming_performances ?? [],
//     }));

//   async function attachFirstUpcoming(venueList: Venue[]): Promise<Venue[]> {
//     const now = new Date();
//     const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
//     const kstMidnight = new Date(kst.getFullYear(), kst.getMonth(), kst.getDate());
//     const afterISO = toNaiveIso(kstMidnight);

//     const enriched = await Promise.all(
//       (venueList || []).map(async (venue) => {
//         try {
//           const raw = await fetchUpcomingPerformancesByVenue(venue.venue_id, afterISO);
//           const perfs: Performance[] = (raw ?? []).map(p => ({
//             id: p.id ?? 0,
//             title: p.title ?? '',
//             date: p.date ?? undefined,
//             time: p.time ?? undefined,
//             image_url: p.image_url ?? undefined,
//             address: p.address ?? undefined,
//           })).slice(0, 1);
//           return { ...venue, upcomingPerformance: perfs };
//         } catch {
//           return { ...venue, upcomingPerformance: [] };
//         }
//       })
//     );
//     return enriched;
//   }

//   const inBounds = (v: Venue, b: Bounds | null) => {
//     if (!b) return true;
//     if (v.latitude == null || v.longitude == null) return true;
//     const { ne, sw } = b;
//     const latOk = v.latitude >= sw.lat && v.latitude <= ne.lat;
//     const lngOk = v.longitude >= sw.lng && v.longitude <= ne.lng;
//     return latOk && lngOk;
//   };

//   async function loadAllVenues(): Promise<Venue[]> {
//     try {
//       const { venues: raw } = await fetchVenueListFlex<any>({ page: 1, size: DEFAULT_PAGE_SIZE });
//       const normalized = normalizeVenues(raw as any[]);
//       const withDetail = await enrichVenuesWithDetail(normalized);
//       return await attachFirstUpcoming(withDetail);
//     } catch (e) {
//       console.error('전체 공연장 목록 로드 실패:', e);
//       return [];
//     }
//   }

//   async function loadByCenter(center: { lat: number; lng: number }, radiusKm = RADIUS_KM, zoom = 15) {
//     setMapCenter(center);
//     setMapZoom(zoom);
//     const list = await fetchNearbyVenues(center.lat, center.lng, radiusKm);
//     const normalized = normalizeVenues(list);
//     const withDetail = await enrichVenuesWithDetail(normalized);
//     return await attachFirstUpcoming(withDetail);
//   }

//   /** ============== 초기 위치 & 데이터 ============== */
//   useEffect(() => {
//     (async () => {
//       try {
//         const all = await loadAllVenues();
//         setVenues(all);

//         const { status } = await Location.getForegroundPermissionsAsync();
//         const enabled = await Location.hasServicesEnabledAsync();

//         if (status === 'granted' && enabled) {
//           const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
//           const center = { lat: loc.coords.latitude, lng: loc.coords.longitude };
//           setMapCenter(center);
//           setMapZoom(15);

//           let nearby = await loadByCenter(center, RADIUS_KM, 15);
//           if (!nearby.length) nearby = await loadByCenter(center, 7, 13);
//           if (nearby.length) setVenues(nearby);

//         } else {
//           setMapCenter(FALLBACK_CENTER);
//           setMapZoom(13);
//         }
//       } catch (e) {
//         console.error('초기 로딩 실패:', e);
//         setMapCenter(FALLBACK_CENTER);
//         setMapZoom(13);
//       }
//     })();
//   }, []);

//   /** ============== 검색 ============== */
//   const searchParam = Array.isArray(params?.search) ? params?.search[0] : params?.search;
//   useEffect(() => { if (searchParam === '1') setSearchOpen(true); }, [searchParam]);
//   const clearSearch = () => { setQ(''); setSearchOpen(false); router.setParams({ search: undefined as any }); };

//   const baseVisible = useMemo(() => venues.filter(v => inBounds(v, mapBounds)), [venues, mapBounds]);
//   const filtered = useMemo(() => {
//     const key = q.trim().toLowerCase();
//     if (!key) return baseVisible;
//     return baseVisible.filter(v =>
//       v.name.toLowerCase().includes(key) ||
//       (v.address || '').toLowerCase().includes(key) ||
//       (v.upcomingPerformance?.[0]?.title || '').toLowerCase().includes(key)
//     );
//   }, [baseVisible, q]);
//   const selectedVenue = useMemo(() => filtered.find(v => v.venue_id === selectedCardId) || null, [filtered, selectedCardId]);

//   const rows: Venue[][] = useMemo(() => {
//     const out: Venue[][] = [];
//     for (let i = 0; i < filtered.length; i += 3) out.push(filtered.slice(i, i + 3));
//     return out;
//   }, [filtered]);

//   const renderData: RenderItem[] = useMemo(() => {
//     const out: RenderItem[] = [];
//     rows.forEach((row) => {
//       out.push({ kind: 'row', items: row });
//       if (selectedCardId != null && row.some(v => v.venue_id === selectedCardId) && selectedVenue) {
//         out.push({ kind: 'wide', venue: selectedVenue });
//       }
//     });
//     return out;
//   }, [rows, selectedCardId, selectedVenue]);

//   const scrollToWide = () => {
//     const idx = renderData.findIndex(it => it.kind === 'wide');
//     if (idx >= 0) requestAnimationFrame(() => listRef.current?.scrollToIndex({ index: idx, viewPosition: 0, animated: true }));
//   };

//   const handleCardPress = (vid: number) => {
//     setSelectedCardId(vid);
//     const v = venues.find(x => x.venue_id === vid);
//     if (v?.latitude != null && v?.longitude != null) {
//       setMapCenter({ lat: v.latitude, lng: v.longitude });
//       setMapZoom(13);
//     }
//     setTimeout(scrollToWide, 0);
//   };

//   const handleMarkerPress = async (id: number | string) => {
//     const vid = Number(id);
//     setSelectedCardId(vid);

//     const v = venues.find(x => x.venue_id === vid);
//     if (v?.latitude != null && v?.longitude != null) {
//       setMapCenter({ lat: v.latitude, lng: v.longitude });
//       setMapZoom(16);
//     }

//     try {
//       const afterISO = toNaiveIso(new Date());
//       const raw = await fetchUpcomingPerformancesByVenue(vid, afterISO);
//       const perfs: Performance[] = (raw ?? []).map(p => ({
//         id: p.id ?? 0,
//         title: p.title ?? '',
//         date: p.date ?? undefined,
//         time: p.time ?? undefined,
//         image_url: p.image_url ?? undefined,
//         address: p.address ?? undefined,
//       })).slice(0, 1);

//       setVenues(prev => {
//         const idx = prev.findIndex(vx => vx.venue_id === vid);
//         if (idx === -1) return prev;
//         const next = [...prev];
//         next[idx] = { ...next[idx], upcomingPerformance: perfs };
//         return next;
//       });

//       requestAnimationFrame(scrollToWide);
//     } catch (e) {
//       console.error('공연 정보 불러오기 실패:', e);
//     }
//   };

//   const handleSearchInMap = async ({ ne, sw, center, zoom }: { ne: BoundsPt; sw: BoundsPt; center: BoundsPt; zoom?: number }) => {
//     try {
//       setMapBounds({ ne, sw });
//       let enriched = await loadByCenter(center, RADIUS_KM, zoom ?? 15);
//       if (!enriched.length) enriched = await loadByCenter(center, 7, zoom ?? 13);
//       setVenues(enriched);
//       setSelectedCardId(null);
//     } catch (e) {
//       console.error('지도 내 검색 실패:', e);
//       Alert.alert('오류', '지도의 범위로 공연장을 불러오지 못했어요.');
//     }
//   };

//   const keyExtractor = (item: RenderItem, index: number) => {
//     if (item.kind === 'row') return `row-${item.items.map(i => i.venue_id).join('-')}-${index}`;
//     return `wide-${item.venue.venue_id}-${index}`;
//   };

//   const renderItem = ({ item }: { item: RenderItem }) => {
//     if (item.kind === 'row') {
//       return (
//         <View style={styles.row}>
//           {item.items.map((v) => (
//             <PerformanceCard
//               key={v.venue_id}
//               type="location"
//               posterUrl={v.upcomingPerformance?.[0]?.image_url || v.thumbnail || 'https://dummyimage.com/300x400/eeeeee/aaaaaa&text=NO+IMAGE'}
//               title={v.name} // 공연장 이름
//               venue={formatTime(v.upcomingPerformance?.[0]?.time)} // 공연 시간
//               onPress={() => router.push(`/venue/${v.venue_id}`)}
//               onToggleLike={() => { }}
//             />
//           ))}
//         </View>
//       );
//     }

//     return (
//       <View style={styles.wideWrap}>
//         <MapWideSelectCard data={item.venue} />
//       </View>
//     );
//   };

//   /** ============== MapView ============== */
//   const latitudeDelta = 0.03;
//   const longitudeDelta = 0.03;

//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
//       <View style={styles.container}>
//         {searchOpen && (
//           <View style={styles.searchBarWrap}>
//             <Ionicons name="search" size={Theme.iconSizes.sm} color={Theme.colors.lightGray} />
//             <TextInput
//               value={q}
//               onChangeText={setQ}
//               placeholder="장소/공연/주소 검색"
//               placeholderTextColor={Theme.colors.lightGray}
//               style={styles.searchInput}
//               returnKeyType="search"
//               autoFocus
//             />
//             {q.length > 0 ? (
//               <Pressable onPress={() => setQ('')} hitSlop={10}>
//                 <Ionicons name="close-circle" size={Theme.iconSizes.sm} color={Theme.colors.lightGray} />
//               </Pressable>
//             ) : (
//               <Pressable onPress={clearSearch} hitSlop={10}>
//                 <Ionicons name="close" size={Theme.iconSizes.sm} color={Theme.colors.lightGray} />
//               </Pressable>
//             )}
//           </View>
//         )}

//         {mapCenter ? (
//           <View style={{ height: 240 }}>
//             <MapView
//               style={{ flex: 1 }}
//               provider={PROVIDER_GOOGLE}
//               region={{
//                 latitude: mapCenter.lat,
//                 longitude: mapCenter.lng,
//                 latitudeDelta,
//                 longitudeDelta,
//               }}
//               onRegionChangeComplete={(region: Region) => {
//                 const ne = { lat: region.latitude + region.latitudeDelta / 2, lng: region.longitude + region.longitudeDelta / 2 };
//                 const sw = { lat: region.latitude - region.latitudeDelta / 2, lng: region.longitude - region.longitudeDelta / 2 };
//                 setMapBounds({ ne, sw });
//               }}
//             >
//               {filtered.map(v => (
//                 <Marker
//                   key={v.venue_id}
//                   coordinate={{ latitude: v.latitude, longitude: v.longitude }}
//                   title={v.name}
//                   pinColor={selectedCardId === v.venue_id ? PIN_COLOR_SELECTED : PIN_COLOR}
//                   onPress={() => handleMarkerPress(v.venue_id)}
//                 >
//                   <IcMarker width={40} height={40} />
//                 </Marker>
//               ))}
//             </MapView>

//             {/* 상단 중앙: 현 지도에서 검색 */}
//             <Pressable
//               onPress={() => {
//                 if (!mapBounds) return;
//                 const center = {
//                   lat: (mapBounds.ne.lat + mapBounds.sw.lat) / 2,
//                   lng: (mapBounds.ne.lng + mapBounds.sw.lng) / 2,
//                 };
//                 handleSearchInMap({ ne: mapBounds.ne, sw: mapBounds.sw, center });
//               }}
//               style={{
//                 position: 'absolute',
//                 top: 8,
//                 alignSelf: 'center',
//                 backgroundColor: 'white',
//                 paddingHorizontal: 12,
//                 paddingVertical: 6,
//                 borderRadius: 20,
//                 shadowColor: '#000',
//                 shadowOpacity: 0.2,
//                 shadowOffset: { width: 0, height: 2 },
//                 shadowRadius: 4,
//                 elevation: 3,
//               }}
//             >
//               <Text style={{ color: Theme.colors.themeOrange, fontWeight: 'bold' }}>현 지도에서 검색</Text>
//             </Pressable>

//             {/* 우측 하단: 내 위치 버튼 */}
//             <Pressable
//               onPress={async () => {
//                 try {
//                   const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
//                   setMapCenter({ lat: loc.coords.latitude, lng: loc.coords.longitude });
//                   setMapZoom(15);
//                 } catch (e) {
//                   Alert.alert('오류', '현재 위치를 가져올 수 없습니다.');
//                 }
//               }}
//               style={{
//                 position: 'absolute',
//                 bottom: 8,
//                 right: 8,
//                 width: 40,
//                 height: 40,
//                 borderRadius: 20,
//                 backgroundColor: 'white',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 shadowColor: '#000',
//                 shadowOpacity: 0.2,
//                 shadowOffset: { width: 0, height: 2 },
//                 shadowRadius: 4,
//                 elevation: 3,
//               }}
//             >
//               <IcMylocation width={24} height={24} fill={Theme.colors.darkGray} />
//             </Pressable>
//           </View>
//         ) : null}

//         <FlatList
//           ref={listRef}
//           data={renderData}
//           keyExtractor={keyExtractor}
//           renderItem={renderItem}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingBottom: 100 }}
//         />
//       </View>
//     </SafeAreaView>
//   );
// }

// /** ===================== 스타일 ===================== */
// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: '#fff' },
//   container: { flex: 1 },
//   row: { flexDirection: 'row', marginTop: 12, paddingHorizontal: 16 },
//   card: { flex: 1, marginHorizontal: 4, backgroundColor: '#f5f5f5', borderRadius: 8, padding: 4 },
//   cardSelected: { borderWidth: 2, borderColor: Theme.colors.themeOrange },
//   poster: { width: '100%', height: 120, borderRadius: 6, marginBottom: 4 },
//   venueName: { fontWeight: 'bold', fontSize: 14, marginBottom: 2 },
//   addrText: { fontSize: 12, color: '#666' },
//   timeText: { fontSize: 12, color: Theme.colors.themeOrange },
//   wideWrap: { marginTop: 12, paddingHorizontal: 16 },
//   searchBarWrap: { flexDirection: 'row', alignItems: 'center', margin: 12, backgroundColor: '#eee', borderRadius: 8, paddingHorizontal: 8 },
//   searchInput: { flex: 1, padding: 8, fontSize: 14 },
// });