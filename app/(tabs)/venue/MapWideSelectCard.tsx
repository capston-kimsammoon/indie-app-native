import React from 'react';
import { View, Image, Text, StyleSheet, Pressable, Alert } from 'react-native';
import type { Venue } from '../location';
import Theme from "@/constants/Theme";
type PerfLite = {
  id?: number;
  title?: string;
  date?: string;
  time?: string;    
  image_url?: string;
};

export default function MapWideSelectCard({ data }: { data: Venue }) {
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

  return (
    <View style={styles.wrap}>
      <Image source={poster ? { uri: poster } : require('@/assets/images/modie-sample.png')} style={styles.poster} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.time}>{timeText}</Text>

        <Pressable onPress={() => Alert.alert('이동', `${data.name} 상세로 이동 (라우터 연결 예정)`)} >
          <Text style={styles.venue} numberOfLines={1}>{data.name} ›</Text>
        </Pressable>

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