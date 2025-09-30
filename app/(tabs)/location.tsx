// app/.../location.tsx
import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, Image,
  SafeAreaView, StatusBar, Platform, TextInput, Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import NaverMapWeb from './venue/NaverMapWeb';
import CurrentTimeText from './venue/CurrentTimeText';
import MapWideSelectCard from './venue/MapWideSelectCard';

import Theme from "@/constants/Theme";
import {
  fetchNearbyVenues,
  fetchUpcomingPerformancesByVenue,
  fetchVenueDetail,
} from '@/Api/venueApi';

export type Performance = {
  id?: number;
  title: string;
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

type BoundsPt = { lat: number; lng: number };
type Bounds = { ne: BoundsPt; sw: BoundsPt };

type RenderRow = { kind: 'row'; items: Venue[] };
type RenderWide = { kind: 'wide'; venue: Venue };
type RenderItem = RenderRow | RenderWide;

const RADIUS_KM = 3;

const addrCache = new Map<number, string>();

async function promisePool<T>(tasks: (() => Promise<T>)[], size = 5) {
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
    5
  );

  return venueList.map(v => (v.address ? v : { ...v, address: addrCache.get(v.venue_id) }));
}

export default function MapPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ search?: string | string[] }>();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [q, setQ] = useState<string>('');

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(15);

  const [mapBounds, setMapBounds] = useState<Bounds | null>(null);

  const listRef = useRef<FlatList<RenderItem>>(null);

  const normalizeVenues = (data: any[]): Venue[] =>
    (data || []).map((v: any) => ({
      ...v,
      venue_id: v.venue_id ?? v.id,
      thumbnail: v.thumbnail ?? v.image_url,
      address: v.address ?? v.road_address ?? v.roadAddress ?? undefined,
      upcomingPerformance: v.upcomingPerformance ?? v.performances ?? [],
      latitude: v.latitude,
      longitude: v.longitude,
      name: v.name,
    }));

  async function attachFirstUpcoming(venueList: Venue[]): Promise<Venue[]> {
    const now = new Date();
    const kstOffsetMin = 9 * 60;
    const utc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const kstMidnight = new Date(utc + kstOffsetMin * 60 * 1000);
    const afterISO = kstMidnight.toISOString();

    const enriched = await Promise.all(
      (venueList || []).map(async (venue) => {
        try {
          const perfs: Performance[] = await fetchUpcomingPerformancesByVenue(venue.venue_id, afterISO);
          return { ...venue, upcomingPerformance: (perfs || []).slice(0, 1) };
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
    const { ne, sw } = b;
    const latOk = v.latitude >= sw.lat && v.latitude <= ne.lat;
    const lngOk = v.longitude >= sw.lng && v.longitude <= ne.lng;
    return latOk && lngOk;
  };

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          const fallback = { lat: 37.5533, lng: 126.9232 };
          setMapCenter(fallback);
          const list = await fetchNearbyVenues(fallback.lat, fallback.lng, RADIUS_KM);
          const normalized = normalizeVenues(list);
          const withDetail = await enrichVenuesWithDetail(normalized);
          setVenues(await attachFirstUpcoming(withDetail));
          return;
        }

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const center = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        setMapCenter(center);
        setMapZoom(15);

        const list = await fetchNearbyVenues(center.lat, center.lng, RADIUS_KM);
        const normalized = normalizeVenues(list);
        const withDetail = await enrichVenuesWithDetail(normalized);
        setVenues(await attachFirstUpcoming(withDetail));
      } catch (e) {
        console.error('❌ 초기 위치/데이터 실패:', e);
        const fallback = { lat: 37.5533, lng: 126.9232 };
        setMapCenter(fallback);
        try {
          const list = await fetchNearbyVenues(fallback.lat, fallback.lng, RADIUS_KM);
          const normalized = normalizeVenues(list);
          const withDetail = await enrichVenuesWithDetail(normalized);
          setVenues(await attachFirstUpcoming(withDetail));
        } catch (e2) {
          console.error('❌ 폴백 로드 실패:', e2);
        }
      }
    })();
  }, []);

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
    setTimeout(scrollToWide, 0);
  };

  const handleMarkerPress = async (id: number | string) => {
    const vid = Number(id);
    try {
      const nowISO = new Date().toISOString();
      const perfs: Performance[] = await fetchUpcomingPerformancesByVenue(vid, nowISO);
      const updated = { ...(venues.find(v => v.venue_id === vid) as Venue), upcomingPerformance: (perfs || []).slice(0,1) };
      setSelectedCardId(vid);
      setVenues(prev => prev.map(v => v.venue_id === vid ? updated : v));
      setTimeout(scrollToWide, 0);
    } catch (e) {
      console.error('공연 정보 불러오기 실패:', e);
      setSelectedCardId(vid);
    }
  };

  const handleSearchInMap = async ({ ne, sw, center, zoom }: { ne: BoundsPt; sw: BoundsPt; center: BoundsPt; zoom?: number }) => {
    try {
      setMapBounds({ ne, sw });
      const list = await fetchNearbyVenues(center.lat, center.lng, RADIUS_KM);
      const normalized = normalizeVenues(list);
      const withDetail = await enrichVenuesWithDetail(normalized);
      const enriched = await attachFirstUpcoming(withDetail);
      setVenues(enriched);
      setMapCenter({ lat: center.lat, lng: center.lng });
      if (typeof zoom === 'number') setMapZoom(zoom);
      setSelectedCardId(null);
    } catch (e) {
      console.error("❌ 지도 내 검색 실패:", e);
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
        <FlatList
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
