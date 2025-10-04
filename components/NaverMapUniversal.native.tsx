import React, { useRef } from "react";
import { View } from "react-native";
import {
  NaverMapView,
  NaverMapMarkerOverlay,
  type NaverMapViewRef,
} from "@mj-studio/react-native-naver-map";

type Marker = { id: string | number; lat: number; lng: number; title?: string };

export default function NaverMapUniversal({
  height = 240,
  markers = [],
  center = { lat: 37.5665, lng: 126.9780 },
  zoom = 14,
  onMarkerPress,
}: {
  height?: number;
  markers?: Marker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerPress?: (id: string | number) => void;
}) {
  const mapRef = useRef<NaverMapViewRef>(null);

  return (
    <View style={{ height }}>
      <NaverMapView
        ref={mapRef}
        style={{ flex: 1 }}
        // ❌ center/zoom 아님
        // ✅ initialCamera 또는 camera 사용
        initialCamera={{
          latitude: center.lat,
          longitude: center.lng,
          zoom,
        }}
        // 필요하면 제어형으로:
        // camera={{ latitude: center.lat, longitude: center.lng, zoom }}
        // onCameraChanged={(e) => { ... }}
      >
        {markers.map((m) => (
          <NaverMapMarkerOverlay
            key={m.id}
            latitude={m.lat}
            longitude={m.lng}
            caption={{ text: m.title ?? String(m.id) }}
            onTap={() => onMarkerPress?.(m.id)}
          />
        ))}
      </NaverMapView>
    </View>
  );
}
