import React, { useMemo, useRef, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as Location from 'expo-location';

type Marker = { id: string | number; lat: number; lng: number; title?: string };

type Props = {
  height?: number;
  markers?: Marker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerPress?: (id: string | number) => void;
  onSearchInMap?: (p: any) => void;

  pinSvg?: string;
  selectedPinSvg?: string;
  selectedId?: number;
};

export default function NaverMapWeb({
  height = 240,
  markers = [],
  center,
  zoom,
  onMarkerPress,
  onSearchInMap,
  pinSvg,
  selectedPinSvg,
  selectedId,
}: Props) {
  const webRef = useRef<WebView>(null);
  const uri = useMemo(() => Asset.fromModule(require('../map.html')).uri, []);
  const post = (m: any) => webRef.current?.postMessage?.(JSON.stringify(m));

  const postMarkers = () => {
    post({
      type: 'setMarkers',
      data: markers,
      pinSvg: pinSvg ?? null,
      selectedPinSvg: selectedPinSvg ?? null,
      selectedId: typeof selectedId === 'number' ? selectedId : null,
    });
  };

  useEffect(() => {
    postMarkers();
  }, [markers]);

  useEffect(() => {
    if (center) post({ type: 'setView', center, zoom });
  }, [center, zoom]);

  useEffect(() => {
    postMarkers();
  }, [pinSvg, selectedPinSvg, selectedId]);

  const handleLocateRequest = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('위치 권한 필요', '설정에서 위치 권한을 허용해 주세요.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      post({
        type: 'locate:set',
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    } catch (e: any) {
      Alert.alert('현재 위치를 가져오지 못했어요', String(e?.message || e));
    }
  };

  return (
    <View style={{ height }}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ uri }}
        onLoadEnd={() => {
          if (center) post({ type: 'setView', center, zoom });
          postMarkers();
        }}
        onMessage={(e) => {
          try {
            const msg = JSON.parse(e.nativeEvent.data);
            if (msg.type === 'marker') onMarkerPress?.(msg.id);
            else if (msg.type === 'searchHere') onSearchInMap?.(msg);
            else if (msg.type === 'locate:request') handleLocateRequest();
          } catch {
          }
        }}
      />
    </View>
  );
}
