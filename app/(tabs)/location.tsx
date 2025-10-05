import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, Image,
  StatusBar, Platform, TextInput, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import NaverMapWeb from './venue/NaverMapWeb';
import CurrentTimeText from './venue/CurrentTimeText';
import MapWideSelectCard from './venue/MapWideSelectCard';

import Theme from '@/constants/Theme';
import {
  fetchNearbyVenues,
  fetchUpcomingPerformancesByVenue,
  fetchVenueDetail,
  fetchVenueListFlex,
} from '@/api/VenueApi';

/** ===================== 상수 ===================== */
const RADIUS_KM = 3;
const FALLBACK_CENTER = { lat: 37.5533, lng: 126.9232 }; 
const DEFAULT_PAGE_SIZE = 200;

/** ============== 타입 ============== */
export type Performance = {
  id?: number;
  title?: string;
  date?: string;
  time?: string;
  image_url?: string;
  address?: string;
};

export type Venue = {
  venue_id: number;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  thumbnail?: string;
  upcomingPerformance?: Performance[];
};

type BoundsPt = { lat: number; lng: number };
type Bounds = { ne: BoundsPt; sw: BoundsPt };

type RenderRow = { kind: 'row'; items: Venue[] };
type RenderWide = { kind: 'wide'; venue: Venue };
type RenderItem = RenderRow | RenderWide;

/** ============== 유틸 ============== */
const makeLucidePinSVG = (color: string, size = Theme.iconSizes.lg) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"
     viewBox="0 0 24 24" fill="none" stroke="${color}"
     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20.84 10.61c0 7.26-8.84 12.39-8.84 12.39S3.16 17.87 3.16 10.61a8.84 8.84 0 1 1 17.68 0Z"/>
  <circle cx="12" cy="10" r="3"/>
</svg>
`;

const PIN_COLOR = Theme.colors.themeOrange;
const PIN_COLOR_SELECTED = Theme.colors.themeOrange;

const addrCache = new Map<number, string>();

async function promisePool<T>(tasks: (() => Promise<T>)[], size = 3) {
  const out: T[] = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, tasks.length) }).map(async () => {
      while (i < tasks.length) {
        const cur = tasks[i++];
        out.push(await cur());
      }
    })
  );
  return out;
}

const toNaiveIso = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${y}-${m}-${day}T${hh}:${mm}:${ss}`;
};

async function fetchVenueDetailSafe(venueId: number) {
  try {
    const detail: any = await fetchVenueDetail(venueId);
    return detail || {};
  } catch {
    return {};
  }
}

async function enrichVenuesWithDetail(venueList: Venue[]) {
  const targets = venueList.filter(
    v => !v.address || !v.latitude || !v.longitude || !v.thumbnail
  );

  await promisePool(
    targets.map(v => async () => {
      const d = await fetchVenueDetailSafe(v.venue_id);
      if (typeof d.address === 'string') addrCache.set(v.venue_id, d.address);

      v.address   = v.address   ?? d.address ?? undefined;
      v.latitude  = v.latitude  ?? d.location?.latitude  ?? v.latitude;
      v.longitude = v.longitude ?? d.location?.longitude ?? v.longitude;
      v.thumbnail = v.thumbnail ?? d.image_url ?? v.thumbnail;

      const first = d?.upcoming_performances?.items?.[0]
                 ?? d?.upcomingPerformances?.[0];
      if (first && !v.upcomingPerformance?.length) {
        v.upcomingPerformance = [first];
      }
    }),
    3
  );

  return venueList.map(v => (v.address ? v : { ...v, address: addrCache.get(v.venue_id) }));
}

/** ============== 컴포넌트 ============== */
export default function MapPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ search?: string | string[] }>();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [q, setQ] = useState<string>('');

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(FALLBACK_CENTER);
  const [mapZoom, setMapZoom] = useState<number>(13);
  const [mapBounds, setMapBounds] = useState<Bounds | null>(null);

  const listRef = useRef<FlatList<RenderItem>>(null);

  const normalizeVenues = (data: any[]): Venue[] =>
    (data || []).map((v: any) => ({
      ...v,
      venue_id: v.venue_id ?? v.id,
      name: v.name ?? v.title ?? '',
      latitude: v.latitude ?? v.lat,
      longitude: v.longitude ?? v.lng ?? v.lon,
      thumbnail: v.thumbnail ?? v.image_url ?? v.poster ?? v.cover,
      address: v.address ?? v.road_address ?? v.roadAddress ?? v.addr ?? undefined,
      upcomingPerformance: v.upcomingPerformance ?? v.performances ?? v.upcoming_performances ?? [],
    }));

  async function attachFirstUpcoming(venueList: Venue[]): Promise<Venue[]> {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const kstMidnight = new Date(kst.getFullYear(), kst.getMonth(), kst.getDate());
    const afterISO = toNaiveIso(kstMidnight);

    const enriched = await Promise.all(
      (venueList || []).map(async (venue) => {
        try {
          const raw = await fetchUpcomingPerformancesByVenue(venue.venue_id, afterISO);
          const perfs: Performance[] = (raw ?? []).map(p => ({
            id: p.id ?? 0,
            title: p.title ?? '',
            date: p.date ?? undefined,
            time: p.time ?? undefined,
            image_url: p.image_url ?? undefined,
            address: p.address ?? undefined,
          })).slice(0, 1);

          return { ...venue, upcomingPerformance: perfs };
        } catch (e) {
          console.error(`공연 불러오기 실패 (venue_id: ${venue.venue_id})`, e);
          return { ...venue, upcomingPerformance: [] };
        }
      })
    );
    return enriched;
  }

  const inBounds = (v: Venue, b: Bounds | null) => {
    if (!b) return true;
    if (v.latitude == null || v.longitude == null) return true; // 좌표 없으면 필터 제외
    const { ne, sw } = b;
    const latOk = v.latitude >= sw.lat && v.latitude <= ne.lat;
    const lngOk = v.longitude >= sw.lng && v.longitude <= ne.lng;
    return latOk && lngOk;
  };

  async function loadAllVenues(): Promise<Venue[]> {
    try {
      const { venues: raw } = await fetchVenueListFlex<any>({ page: 1, size: DEFAULT_PAGE_SIZE });
      const normalized = normalizeVenues(raw as any[]);
      const withDetail = await enrichVenuesWithDetail(normalized);
      return await attachFirstUpcoming(withDetail);
    } catch (e) {
      console.error('❌ 전체 공연장 목록 로드 실패:', e);
      return [];
    }
  }

  async function loadByCenter(center: { lat: number; lng: number }, radiusKm = RADIUS_KM, zoom = 15) {
    setMapCenter(center);
    setMapZoom(zoom);
    const list = await fetchNearbyVenues(center.lat, center.lng, radiusKm);
    const normalized = normalizeVenues(list);
    const withDetail = await enrichVenuesWithDetail(normalized);
    return await attachFirstUpcoming(withDetail);
  }

  useEffect(() => {
    (async () => {
      try {
        // ❶ 전체 공연장 먼저 불러오기
        const all = await loadAllVenues();
        setVenues(all);

        // ❷ Expo 권한 상태 확인
        const { status } = await Location.getForegroundPermissionsAsync();
        console.log("Location permission status:", status);
        const enabled = await Location.hasServicesEnabledAsync();
        console.log("Location services enabled:", enabled);

        if (status === 'granted' && enabled) {
          // 위치 서비스 켜져있고 권한도 허용됨
          // → WebView 렌더 후 위치 요청
          setMapCenter(FALLBACK_CENTER); // 먼저 fallback 렌더
          setMapZoom(13);

          setTimeout(async () => {
            try {
              const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest, // 높은 정확도
              });
              const center = { lat: loc.coords.latitude, lng: loc.coords.longitude };
              setMapCenter(center);
              setMapZoom(15);

              let nearby = await loadByCenter(center, RADIUS_KM, 15);
              if (!nearby.length) nearby = await loadByCenter(center, 7, 13);
              if (nearby.length) setVenues(nearby);

            } catch (e) {
              console.warn('위치 가져오기 실패, fallback 사용', e);
              setMapCenter(FALLBACK_CENTER);
              setMapZoom(13);
            }
          }, 800); // 0.8초 딜레이

        } else if (status !== 'granted') {
          // 권한 요청
          const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
          if (newStatus === 'granted') {
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
            const center = { lat: loc.coords.latitude, lng: loc.coords.longitude };
            setMapCenter(center);
            setMapZoom(15);

            let nearby = await loadByCenter(center, RADIUS_KM, 15);
            if (!nearby.length) nearby = await loadByCenter(center, 7, 13);
            if (nearby.length) setVenues(nearby);
          } else {
            console.warn('위치 권한이 거부되었습니다. 기본 위치로 표시합니다.');
            setMapCenter(FALLBACK_CENTER);
            setMapZoom(13);
          }
        } else {
          // 권한은 있지만 위치 서비스 꺼짐
          console.warn('위치 서비스가 꺼져 있습니다. 기본 위치로 표시합니다.');
          setMapCenter(FALLBACK_CENTER);
          setMapZoom(13);
        }

      } catch (e) {
        console.error('❌ 초기 로딩 실패:', e);
        setMapCenter(FALLBACK_CENTER);
        setMapZoom(13);
      }
    })();
  }, []);


  // 쿼리로 검색 열기
  const searchParam = Array.isArray(params?.search) ? params?.search[0] : params?.search;
  useEffect(() => {
    if (searchParam === '1') setSearchOpen(true);
  }, [searchParam]);

  const clearSearch = () => {
    setQ('');
    setSearchOpen(false);
    router.setParams({ search: undefined as any });
  };

  const baseVisible = useMemo(
    () => venues.filter(v => inBounds(v, mapBounds)),
    [venues, mapBounds]
  );

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return baseVisible;
    return baseVisible.filter(v =>
      v.name.toLowerCase().includes(key) ||
      (v.address || '').toLowerCase().includes(key) ||
      (v.upcomingPerformance?.[0]?.title || '').toLowerCase().includes(key)
    );
  }, [baseVisible, q]);

  const selectedVenue = useMemo(
    () => filtered.find(v => v.venue_id === selectedCardId) || null,
    [filtered, selectedCardId]
  );

  const rows: Venue[][] = useMemo(() => {
    const out: Venue[][] = [];
    for (let i = 0; i < filtered.length; i += 3) {
      out.push(filtered.slice(i, i + 3));
    }
    return out;
  }, [filtered]);

  const renderData: RenderItem[] = useMemo(() => {
    const out: RenderItem[] = [];
    rows.forEach((row) => {
      out.push({ kind: 'row', items: row });
      if (selectedCardId != null && row.some(v => v.venue_id === selectedCardId) && selectedVenue) {
        out.push({ kind: 'wide', venue: selectedVenue });
      }
    });
    return out;
  }, [rows, selectedCardId, selectedVenue]);

  const scrollToWide = () => {
    const idx = renderData.findIndex(it => it.kind === 'wide');
    if (idx >= 0) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex({ index: idx, viewPosition: 0, animated: true });
      });
    }
  };

  const handleCardPress = (vid: number) => {
    setSelectedCardId(vid);
    const v = venues.find(x => x.venue_id === vid);
    if (v?.latitude != null && v?.longitude != null) {
      setMapCenter({ lat: v.latitude, lng: v.longitude });
      setMapZoom(13);
    }
    setTimeout(scrollToWide, 0);
  };

  const handleMarkerPress = async (id: number | string) => {
    const vid = Number(id);
    setSelectedCardId(vid);

    const v = venues.find(x => x.venue_id === vid);
    if (v?.latitude != null && v?.longitude != null) {
      setMapCenter({ lat: v.latitude, lng: v.longitude });
      setMapZoom(16);
    }

    try {
      const afterISO = toNaiveIso(new Date());
      const raw = await fetchUpcomingPerformancesByVenue(vid, afterISO);
      const perfs: Performance[] = (raw ?? []).map(p => ({
        id: p.id ?? 0,
        title: p.title ?? '',
        date: p.date ?? undefined,
        time: p.time ?? undefined,
        image_url: p.image_url ?? undefined,
        address: p.address ?? undefined,
      })).slice(0, 1);

      setVenues(prev => {
        const idx = prev.findIndex(vx => vx.venue_id === vid);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], upcomingPerformance: perfs };
        return next;
      });

      requestAnimationFrame(scrollToWide);
    } catch (e) {
      console.error('공연 정보 불러오기 실패:', e);
    }
  };

  const handleSearchInMap = async ({
    ne, sw, center, zoom,
  }: { ne: BoundsPt; sw: BoundsPt; center: BoundsPt; zoom?: number }) => {
    try {
      setMapBounds({ ne, sw });
      let enriched = await loadByCenter(center, RADIUS_KM, zoom ?? 15);
      if (!enriched.length) enriched = await loadByCenter(center, 7, zoom ?? 13);
      setVenues(enriched);
      setSelectedCardId(null);
    } catch (e) {
      console.error('지도 내 검색 실패:', e);
      Alert.alert('오류', '지도의 범위로 공연장을 불러오지 못했어요.');
    }
  };

  const keyExtractor = (item: RenderItem, index: number) => {
    if (item.kind === 'row') {
      const ids = item.items.map(i => i.venue_id).join('-');
      return `row-${ids}-${index}`;
    }
    return `wide-${item.venue.venue_id}-${index}`;
  };

  const renderItem = ({ item }: { item: RenderItem }) => {
    if (item.kind === 'row') {
      return (
        <View style={styles.row}>
          {item.items.map((v) => (
            <Pressable
              key={v.venue_id}
              style={[styles.card, selectedCardId === v.venue_id && styles.cardSelected]}
              onPress={() => handleCardPress(v.venue_id)}
            >
              <Image
                source={{
                  uri:
                    v.upcomingPerformance?.[0]?.image_url ||
                    v.thumbnail ||
                    'https://dummyimage.com/300x400/eeeeee/aaaaaa&text=NO+IMAGE',
                }}
                style={styles.poster}
              />
              <Text numberOfLines={1} style={styles.venueName}>{v.name}</Text>

              {v.address ? (
                <Text numberOfLines={1} style={styles.addrText}>{v.address}</Text>
              ) : null}

              <Text numberOfLines={1} style={styles.timeText}>
                {formatOnlyTime(v.upcomingPerformance?.[0]?.time) || '예정 공연 없음'}
              </Text>
            </Pressable>
          ))}
          {Array.from({ length: Math.max(0, 3 - item.items.length) }).map((_, i) => (
            <View key={`sp-${i}`} style={[styles.card, { opacity: 0 }]} />
          ))}
        </View>
      );
    }
    return (
      <View style={styles.wideWrap}>
        <MapWideSelectCard data={item.venue} />
      </View>
    );
  };

  const pinSvg = useMemo(() => makeLucidePinSVG(PIN_COLOR, Theme.iconSizes.lg), []);
  const selectedPinSvg = useMemo(() => makeLucidePinSVG(PIN_COLOR_SELECTED, 40), []);
  const markers = useMemo(
    () => filtered.map(v => ({ id: v.venue_id, lat: v.latitude, lng: v.longitude, title: v.name })),
    [filtered]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
      <View style={styles.container}>
        {searchOpen && (
          <View style={styles.searchBarWrap}>
            <Ionicons name="search" size={Theme.iconSizes.sm} color={Theme.colors.lightGray} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="장소/공연/주소 검색"
              placeholderTextColor={Theme.colors.lightGray}
              style={styles.searchInput}
              returnKeyType="search"
              autoFocus
            />
            {q.length > 0 ? (
              <Pressable onPress={() => setQ('')} hitSlop={10}>
                <Ionicons name="close-circle" size={Theme.iconSizes.sm} color={Theme.colors.lightGray} />
              </Pressable>
            ) : (
              <Pressable onPress={clearSearch} hitSlop={10}>
                <Ionicons name="close" size={Theme.iconSizes.sm} color={Theme.colors.lightGray}/>
              </Pressable>
            )}
          </View>
        )}

        {mapCenter ? (
          <NaverMapWeb
            height={240}
            markers={markers}
            center={mapCenter}
            zoom={mapZoom}
            onMarkerPress={handleMarkerPress}
            onSearchInMap={handleSearchInMap}
            pinSvg={pinSvg}
            selectedPinSvg={selectedVenue ? selectedPinSvg : undefined}
            selectedId={selectedCardId ?? undefined}
          />
        ) : (
          <View style={{ height: 240, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: Theme.colors.lightGray }}>지도 불러오는 중...</Text>
          </View>
        )}

        <CurrentTimeText />
        <FlatList<RenderItem>
          ref={listRef}
          data={renderData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.lg }}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              listRef.current?.scrollToIndex({ index: info.index, animated: true });
            }, 200);
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: Theme.colors.lightGray }}>표시할 공연장이 없어요</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

function formatOnlyTime(time?: string) {
  if (!time) return '';
  const [hourStr, minuteStr = '00'] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const period = hour >= 12 ? '오후' : '오전';
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  return minute === 0 ? `${period} ${formattedHour}시` : `${period} ${formattedHour}시 ${minute}분`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.white },
  container: { flex: 1 },

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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 2,
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.black,
  },

  row: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.md,
    justifyContent: 'space-between',
  },

  card: { width: '31%' },
  cardSelected: { borderColor: Theme.colors.themeOrange, borderWidth: 1, borderRadius: 10 },
  poster: { width: '100%', aspectRatio: 3 / 4, borderRadius: 8 },
  venueName: { marginTop: Theme.spacing.md, fontWeight: Theme.fontWeights.semibold},
  addrText: { marginTop: 2, color: Theme.colors.darkGray, fontSize: Theme.fontSizes.xs},
  timeText: { marginTop: 2, color: Theme.colors.darkGray },

  wideWrap: {
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
    paddingHorizontal: 0,
  },
});
