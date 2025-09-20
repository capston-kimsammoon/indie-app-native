import React from 'react';
import { View, Image, Text, StyleSheet, Pressable, Alert } from 'react-native';
import type { Venue } from '../location';

export default function MapWideSelectCard({ data }: { data: Venue }){
const perf = data.upcomingPerformance?.[0];
const poster = perf?.image_url || data.thumbnail || 'https://dummyimage.com/300x400/eeeeee/aaaaaa&text=NO+IMAGE';
return (
<View style={styles.wrap}>
<Image source={{ uri: poster }} style={styles.poster} />
<View style={styles.info}>
<Text style={styles.title} numberOfLines={1}>{perf?.title || '공연 없음'}</Text>
<Text style={styles.time}>{perf?.time ? formatTimeOnly(perf.time) : '-'}</Text>
<Pressable onPress={() => Alert.alert('이동', `${data.name} 상세로 이동 (라우터 연결 예정)`) }>
<Text style={styles.venue} numberOfLines={1}>{data.name} ›</Text>
</Pressable>
<Pressable onPress={() => perf?.address && console.log('📋 copy address:', perf.address)}>
<Text style={styles.addr} numberOfLines={1}>📍 {perf?.address || data.address || '-'}</Text>
</Pressable>
</View>
</View>
);
}

function formatTimeOnly(t?: string){ if(!t) return ''; const [hs, ms='00']=t.split(':'); const h=+hs, m=+ms; const p=h>=12?'오후':'오전'; const h12=h%12===0?12:h%12; return `${p} ${h12}시${m===0?'':` ${m}분`}`; }

const styles = StyleSheet.create({
wrap: { flexDirection: 'row', width: '100%', backgroundColor: '#FFDBBA', borderRadius: 13, padding: 8, gap: 12 },
poster: { width: 90, height: 120, borderRadius: 6 },
info: { flex: 1, justifyContent: 'space-between' },
title: { fontWeight: '700', fontSize: 16 },
time: { marginTop: 6, color: '#222' },
venue: { marginTop: 6, fontWeight: '700', fontSize: 16 },
addr: { marginTop: 4, color:'#555' },
});