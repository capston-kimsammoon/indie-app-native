// MapWideSelectCard.tsx
import React from 'react';
import { View, Image, Text, StyleSheet, Pressable } from 'react-native';
import type { Venue } from '../location';
import { useRouter } from 'expo-router';
import Theme from "@/constants/Theme";

type PerfLite = {
  id?: number;
  title?: string;
  date?: string;
  time?: string;
  image_url?: string;
};

export default function MapWideSelectCard({ data }: { data: Venue }) {
  const router = useRouter();

  const first: unknown =
    (data as any).upcomingPerformance?.[0] ??
    (data as any).performances?.[0] ??
    null;

  const perf = (first || {}) as PerfLite;

  const poster =
    perf.image_url ||
    data.thumbnail ||
    'https://dummyimage.com/300x400/eeeeee/aaaaaa&text=NO+IMAGE';

  const title = perf.title || '공연 없음';
  const timeText = perf.time ? formatTimeOnly(perf.time) : '-';
  const address = data.address || '-';

  // ▶ 공연 상세 라우팅용 id (있을 때만 동작)
  const pid = perf?.id != null ? String(perf.id) : null;
  const goPerf = () => { if (pid) router.push(`/performance/${pid}`); };

  // ▶ 공연장 상세 라우팅용 id
  const vid = (data as any).venue_id ?? (data as any).id;
  const goVenue = () => { if (vid != null) router.push(`/venue/${String(vid)}`); };

  return (
    <View style={styles.wrap}>
      {/* (선택) 포스터 눌러도 공연 상세 이동하게 하고 싶으면 Pressable로 감싸기 */}
      <Pressable onPress={goPerf} disabled={!pid}>
        <Image
          source={poster ? { uri: poster } : require('@/assets/images/modie-sample.png')}
          style={styles.poster}
        />
      </Pressable>

      <View style={styles.info}>
        {/* 제목 → 공연 상세로 */}
        <Pressable onPress={goPerf} disabled={!pid}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
        </Pressable>

        <Text style={styles.time}>{timeText}</Text>

        {/* 장소 이름 → 공연장 상세로 */}
        <Pressable onPress={goVenue}>
          <Text style={styles.venue} numberOfLines={1}>{data.name} ›</Text>
        </Pressable>

        {/* 주소 로그는 기존 유지 */}
        <Pressable onPress={() => address !== '-' && console.log('📋 copy address:', address)}>
          <Text style={styles.addr} numberOfLines={1}>📍 {address}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function formatTimeOnly(t?: string) {
  if (!t) return '';
  const [hs, ms = '00'] = t.split(':');
  const h = parseInt(hs, 10);
  const m = parseInt(ms, 10);
  const p = h >= 12 ? '오후' : '오전';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${p} ${h12}시` : `${p} ${h12}시 ${m}분`;
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', width: '100%', backgroundColor: Theme.colors.white, borderRadius: 13, padding: Theme.spacing.sm, gap: Theme.spacing.sm },
  poster: { width: 90, height: 120, borderRadius: 6 },
  info: { flex: 1, justifyContent: 'space-between' },
  title: { fontWeight: Theme.fontWeights.bold, fontSize: Theme.fontSizes.base },
  time: { marginTop: Theme.spacing.sm, color: Theme.colors.black },
  venue: { marginTop: Theme.spacing.sm, fontWeight: Theme.fontWeights.bold, fontSize: Theme.fontSizes.base },
  addr: { marginTop: Theme.spacing.sm, color: Theme.colors.darkGray },
});
