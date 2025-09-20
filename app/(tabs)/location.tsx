import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, Image,
  SafeAreaView, StatusBar, Platform, TextInput
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import NaverMapWeb from './venue/NaverMapWeb';
import CurrentTimeText from './venue/CurrentTimeText';
import MapWideSelectCard from './venue/MapWideSelectCard';
import { MapPin as LucideMapPin } from 'lucide-react-native';

export type Performance = {
  title: string;
  date?: string;
  time?: string;
  image_url?: string;
  thumbnail?: string;
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

const DUMMY_VENUES: Venue[] = [
  {
    venue_id: 1,
    name: '롤링홀',
    address: '서울 마포구 어딘가 123',
    latitude: 37.5487,
    longitude: 126.9195,
    thumbnail: 'https://picsum.photos/seed/roll/300/400',
    upcomingPerformance: [
      { title: '언드', date: '2025-09-20', time: '19:30', image_url: 'https://picsum.photos/seed/p1/300/400' },
    ],
  },
  {
    venue_id: 2,
    name: '클럽 빅팀',
    address: '서울 마포구 어쩌구 45',
    latitude: 37.5508,
    longitude: 126.9217,
    thumbnail: 'https://picsum.photos/seed/victim/300/400',
    upcomingPerformance: [
      { title: '인터플레이', date: '2025-09-21', time: '20:00', image_url: 'https://picsum.photos/seed/p2/300/400' },
    ],
  },
  {
    venue_id: 3,
    name: '플레이그라운드 1080',
    address: '서울 마포구 홍대로 1',
    latitude: 37.5533,
    longitude: 126.9232,
    thumbnail: 'https://picsum.photos/seed/pg1080/300/400',
    upcomingPerformance: [
      { title: 'SOUND ATTACK', date: '2025-09-22', time: '18:00', image_url: 'https://picsum.photos/seed/p3/300/400' },
    ],
  },
  {
    venue_id: 4,
    name: '얼리웨이 탭하우스',
    address: '서울 마포구 맥주로 7',
    latitude: 37.5552,
    longitude: 126.9248,
    thumbnail: 'https://picsum.photos/seed/alley/300/400',
    upcomingPerformance: [],
  },
  {
    venue_id: 5,
    name: '김포 스테이지 A',
    address: '서울 강서구 공항대로 123',
    latitude: 37.5615,
    longitude: 126.8012,
    thumbnail: 'https://picsum.photos/seed/gimpoA/300/400',
    upcomingPerformance: [
      { title: 'RUNWAY LIVE', date: '2025-09-23', time: '19:00', image_url: 'https://picsum.photos/seed/gp1/300/400' },
    ],
  },
  {
    venue_id: 6,
    name: '공항 컬처홀 B',
    address: '서울 강서구 하늘길 45',
    latitude: 37.5589,
    longitude: 126.7898,
    thumbnail: 'https://picsum.photos/seed/gimpoB/300/400',
    upcomingPerformance: [
      { title: 'JET SOUND', date: '2025-09-24', time: '20:00', image_url: 'https://picsum.photos/seed/gp2/300/400' },
    ],
  },
  {
    venue_id: 7,
    name: 'GMP 라이브라운지',
    address: '서울 강서구 방화대로 77',
    latitude: 37.5668,
    longitude: 126.7985,
    thumbnail: 'https://picsum.photos/seed/gimpoC/300/400',
    upcomingPerformance: [
      { title: 'TAXIWAY JAZZ', date: '2025-09-25', time: '18:30', image_url: 'https://picsum.photos/seed/gp3/300/400' },
    ],
  },
];

const makeLucidePinSVG = (color: string, size = 28) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"
     viewBox="0 0 24 24" fill="none" stroke="${color}"
     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20.84 10.61c0 7.26-8.84 12.39-8.84 12.39S3.16 17.87 3.16 10.61a8.84 8.84 0 1 1 17.68 0Z"/>
  <circle cx="12" cy="10" r="3"/>
</svg>
`;

const PIN_COLOR = '#d55a1f';
const PIN_COLOR_SELECTED = '#e74c3c';

type BoundsPt = { lat: number; lng: number };
const inBounds = (latRaw: number, lngRaw: number, neRaw: BoundsPt, swRaw: BoundsPt) => {
  const lat = Number(latRaw), lng = Number(lngRaw);
  let ne = { lat: Number(neRaw.lat), lng: Number(neRaw.lng) };
  let sw = { lat: Number(swRaw.lat), lng: Number(swRaw.lng) };
  if (ne.lat < sw.lat) { const t = ne.lat; ne.lat = sw.lat; sw.lat = t; }
  const crosses = ne.lng < sw.lng;
  const eps = 1e-6;
  const inLat = lat > sw.lat - eps && lat < ne.lat + eps;
  const inLng = crosses
    ? (lng > sw.lng - eps || lng < ne.lng + eps)
    : (lng > sw.lng - eps && lng < ne.lng + eps);
  return inLat && inLng;
};

type RenderRow = { kind: 'row'; items: Venue[] };
type RenderWide = { kind: 'wide'; venue: Venue };
type RenderItem = RenderRow | RenderWide;

export default function MapPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ search?: string }>();

  const [venues, setVenues] = useState<Venue[]>(DUMMY_VENUES);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [q, setQ] = useState<string>('');

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 37.5533, lng: 126.9232 });
  const [mapZoom, setMapZoom] = useState<number>(13);

  const listRef = useRef<FlatList<RenderItem>>(null);

  useEffect(() => {
    if (params?.search === '1') setSearchOpen(true);
  }, [params?.search]);

  const clearSearch = () => {
    setQ('');
    setSearchOpen(false);
    router.setParams({ search: undefined as any });
  };

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return venues;
    return venues.filter(v =>
      v.name.toLowerCase().includes(key) ||
      (v.address || '').toLowerCase().includes(key) ||
      (v.upcomingPerformance?.[0]?.title || '').toLowerCase().includes(key)
    );
  }, [venues, q]);

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

  const log = (...args: any[]) => console.log('🧭[MapPage]', ...args);

  const handleSearchInMap = ({ ne, sw, center, zoom }: { ne: BoundsPt; sw: BoundsPt; center: BoundsPt; zoom?: number }) => {
    log('searchHere bounds:', { ne, sw, center, zoom });
    const next = DUMMY_VENUES.filter(v => inBounds(v.latitude, v.longitude, ne, sw));
    log('filtered venues count:', next.length);

    setQ('');
    setMapCenter({ lat: center.lat, lng: center.lng });
    if (typeof zoom === 'number') setMapZoom(zoom);

    setVenues(next);
    setSelectedCardId(null);
  };

  const handleCardPress = (vid: number) => {
    setSelectedCardId(vid);
    setTimeout(scrollToWide, 0);
  };
  const handleMarkerPress = (id: number | string) => {
    const vid = Number(id);
    setSelectedCardId(vid);
    setTimeout(scrollToWide, 0);
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

  const pinSvg = useMemo(() => makeLucidePinSVG(PIN_COLOR, 28), []);
  const selectedPinSvg = useMemo(() => makeLucidePinSVG(PIN_COLOR_SELECTED, 28), []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
      <View style={styles.container}>
        {searchOpen && (
          <View style={styles.searchBarWrap}>
            <Ionicons name="search" size={18} color="#888" />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="장소/공연/주소 검색"
              placeholderTextColor="#aaa"
              style={styles.searchInput}
              returnKeyType="search"
              autoFocus
            />
            {q.length > 0 ? (
              <Pressable onPress={() => setQ('')} hitSlop={10}>
                <Ionicons name="close-circle" size={18} color="#bbb" />
              </Pressable>
            ) : (
              <Pressable onPress={clearSearch} hitSlop={10}>
                <Ionicons name="close" size={18} color="#bbb" />
              </Pressable>
            )}
          </View>
        )}
        <NaverMapWeb
          height={240}
          markers={useMemo(() => filtered.map(v => ({ id: v.venue_id, lat: v.latitude, lng: v.longitude, title: v.name })), [filtered])}
          center={mapCenter}
          zoom={mapZoom}
          onMarkerPress={handleMarkerPress}
          onSearchInMap={handleSearchInMap}
          pinSvg={pinSvg}
          selectedPinSvg={selectedVenue ? selectedPinSvg : undefined}
          selectedId={selectedCardId ?? undefined}
        />

        <CurrentTimeText />
        <FlatList
          ref={listRef}
          data={renderData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              listRef.current?.scrollToIndex({ index: info.index, animated: true });
            }, 200);
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: '#999' }}>표시할 공연장이 없어요</Text>
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
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },

  searchBarWrap: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e5e5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 2,
    fontSize: 14,
    color: '#111',
  },

  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    justifyContent: 'space-between',
  },

  card: { width: '31%' },
  cardSelected: { borderColor: 'rgba(241,79,33,0.8)', borderWidth: 1, borderRadius: 10 },
  poster: { width: '100%', aspectRatio: 3 / 4, borderRadius: 8 },
  venueName: { marginTop: 6, fontWeight: '600' },
  timeText: { marginTop: 2, color: '#666' },

  wideWrap: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 0,
  },
});
