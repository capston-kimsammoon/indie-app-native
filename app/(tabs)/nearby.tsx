// app/(tabs)/nearby.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  Platform,
  Linking,
} from "react-native";
import NaverMapWebView from "@/components/maps/NaverMapWebView";
import PerformanceCard from "@/components/cards/PerformanceCard";
import SelectedPerformanceCard from "@/components/cards/SelectedPerformanceCard";
import IcRefresh from "@/assets/icons/ic-refresh.svg";
import IcMyLocation from "@/assets/icons/ic-mylocation.svg";
import { getNowTime, formatTime } from "@/utils/dateUtils";
import Theme from "@/constants/Theme";
import NearbyApi from "@/api/NearbyApi";
import { NearbyPerformanceResponse, VenuePerformanceItem, PerformanceBoundsRequest } from "@/types/nearby";
import * as Location from "expo-location";
import { useAuthStore } from "@/src/state/authStore";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const MAP_HEIGHT = SCREEN_HEIGHT * 0.4;

const makeMarkerSVG = (size: number) => {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 -960 960 960">
  <defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <g filter="url(#shadow)">
    <!-- 오렌지색 원 배경 -->
    <circle cx="480" cy="-480" r="400" fill="${Theme.colors.themeOrange}"/>
    
    <!-- 흰색 음표 모양 -->
    <path 
      d="M400-240q50 0 85-35t35-85v-280h120v-80H460v256q-14-8-29-12t-31-4q-50 0-85 35t-35 85q0 50 35 85t85 35Zm80 160q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"
      fill="#FAFAFA"
    />
    
    <!-- 테두리 -->
    <circle cx="480" cy="-480" r="400" fill="none" stroke="${Theme.colors.themeOrange}" stroke-width="50"/>
  </g>
</svg>
  `.trim();
};

export default function TabNearbyScreen() {
  const listRef = useRef<FlatList>(null);

  const [performances, setPerformances] = useState<NearbyPerformanceResponse[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<NearbyPerformanceResponse | null>(null);
  const [venueDetailPerformances, setVenueDetailPerformances] = useState<VenuePerformanceItem[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.978 });
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapZoom, setMapZoom] = useState(15);
  const [currentBounds, setCurrentBounds] = useState<PerformanceBoundsRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [nowTime, setNowTime] = useState(getNowTime());
  const [initialLocationLoading, setInitialLocationLoading] = useState(true);

  const { user } = useAuthStore();
  const [localLocationEnabled, setLocalLocationEnabled] = useState(true);

  // 초기 위치 및 공연 조회 - 더 빠른 로딩
  useEffect(() => {
    const defaultCenter = { lat: 37.5665, lng: 126.978 };
    const defaultBounds = calculateBounds(defaultCenter.lat, defaultCenter.lng, 0.01);
    setMapCenter(defaultCenter);
    setCurrentBounds(defaultBounds);
    fetchPerformancesInBounds(defaultBounds);

    // 위치 권한 및 현재 위치는 백그라운드에서 가져오기
    (async () => {
      const ok = await ensureLocationCanUse();
      if (!ok) {
        setInitialLocationLoading(false);
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = location.coords;

        setMyLocation({ lat: latitude, lng: longitude });
        setMapCenter({ lat: latitude, lng: longitude });

        const bounds = calculateBounds(latitude, longitude, 0.01);
        setCurrentBounds(bounds);
        await fetchPerformancesInBounds(bounds);
      } catch (err) {
        console.error("❌ 현재 위치 조회 실패:", err);
      } finally {
        setInitialLocationLoading(false);
      }
    })();
  }, []);

  const calculateBounds = (lat: number, lng: number, delta: number = 0.01): PerformanceBoundsRequest => {
    const bounds = {
      sw_lat: lat - delta,
      sw_lng: lng - delta,
      ne_lat: lat + delta,
      ne_lng: lng + delta,
    };
    return bounds;
  };

  const fetchPerformancesInBounds = async (bounds: PerformanceBoundsRequest) => {
    setLoading(true);
    try {
      const data = await NearbyApi.getPerformancesInBounds(bounds);
      setPerformances(data);

      if (data.length === 0) {
        console.warn('⚠️ No performances found in this area');
      }
    } catch (err) {
      console.error("❌ 지도 공연 조회 실패:", err);
      if (err instanceof Error) {
        console.error("Error details:", err.message, err.stack);
      }
      Alert.alert("오류", "공연 정보를 불러오는데 실패했습니다.");
      setPerformances([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVenueSelect = useCallback(async (venue: NearbyPerformanceResponse, index: number) => {
    setSelectedVenue(venue);

    try {
      const data = await NearbyApi.getVenuePerformances(venue.venue_id, new Date().toISOString());
      setVenueDetailPerformances(data);
    } catch (err) {
      console.error("❌ 공연장 상세 조회 실패:", err);
      setVenueDetailPerformances([]);
    }

    if (venue.latitude && venue.longitude) {
      setMapCenter({ lat: venue.latitude, lng: venue.longitude });
      setMapZoom(16);
    }

    if (listRef.current) {
      const rowIndex = Math.floor(index / 3);
      const rowHeight = 250 + Theme.spacing.sm;
      listRef.current.scrollToOffset({ offset: rowIndex * rowHeight, animated: true });
    }
  }, []);

  const handleCardPress = (venue: NearbyPerformanceResponse, index: number) => {
    handleVenueSelect(venue, index);
  };

  const handleMarkerPress = async (id: string | number) => {
    const venueId = Number(id);

    if (venueId === -1) {
      return;
    }

    const venue = performances.find(v => v.venue_id === venueId);

    if (venue) {
      const index = performances.indexOf(venue);
      await handleVenueSelect(venue, index);
    } else {
      console.warn('⚠️ Venue not found for id:', venueId);
    }
  };

  const ensureLocationCanUse = async (): Promise<boolean> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();

      if (status !== "granted") {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();

        if (newStatus !== "granted") {
          if (Platform.OS === "ios") {
            Alert.alert(
              "위치 접근 불가",
              "설정 > 개인정보 보호 > 위치 서비스에서 권한을 허용해주세요.",
              [
                { text: "설정으로 이동", onPress: () => Linking.openSettings() },
                { text: "닫기", style: "cancel" }
              ]
            );
          } else {
            Alert.alert("위치 접근 불가", "위치 정보를 사용하려면 권한을 허용해주세요.");
          }
          return false;
        }
      }

      const enabled = user?.location_enabled ?? localLocationEnabled;

      if (!enabled) {
        Alert.alert(
          "위치 기능 비활성화",
          "위치정보 사용을 켜야 내 위치를 볼 수 있어요.",
          [
            { text: "계속 기본 위치", style: "cancel" },
            {
              text: "켜기",
              onPress: () => {
                if (user) {
                  Alert.alert("알림", "마이페이지에서 위치 사용을 켜주세요.");
                } else {
                  setLocalLocationEnabled(true);
                  Alert.alert("알림", "위치 사용이 활성화되었습니다.");
                }
              }
            }
          ]
        );
        return false;
      }

      return true;
    } catch (err) {
      console.error("❌ 위치 사용 가능 여부 확인 실패:", err);
      return false;
    }
  };

  const goToMyLocation = async () => {
    const ok = await ensureLocationCanUse();
    if (!ok) {
      console.log('⚠️ Cannot use location');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;

      setMyLocation({ lat: latitude, lng: longitude });
      setMapCenter({ lat: latitude, lng: longitude });
      setMapZoom(15);

      const bounds = calculateBounds(latitude, longitude, 0.01);
      setCurrentBounds(bounds);
      await fetchPerformancesInBounds(bounds);
    } catch (err) {
      console.error("❌ 현재 위치 가져오기 실패:", err);
      Alert.alert("오류", "현재 위치를 가져오는데 실패했습니다.");
    }
  };

  const onSearchCurrentMap = async () => {
    setNowTime(getNowTime());

    if (!currentBounds) {
      console.warn('⚠️ No current bounds available, calculating from center');
      const bounds = calculateBounds(mapCenter.lat, mapCenter.lng, 0.01);
      setCurrentBounds(bounds);
      await fetchPerformancesInBounds(bounds);
      return;
    }

    await fetchPerformancesInBounds(currentBounds);
  };

  const handleMapSearchInBounds = useCallback((params: {
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
    center: { lat: number; lng: number };
    zoom?: number;
  }) => {

    const bounds = {
      sw_lat: params.sw.lat,
      sw_lng: params.sw.lng,
      ne_lat: params.ne.lat,
      ne_lng: params.ne.lng,
    };

    setCurrentBounds(bounds);
    setMapCenter({ lat: params.center.lat, lng: params.center.lng });
    if (params.zoom) {
      setMapZoom(params.zoom);
    }
  }, []);

  // 마커 데이터 변환 (공연장 마커만)
  const venueMarkers = performances
    .filter(v => v.latitude != null && v.longitude != null)
    .map(v => ({
      id: v.venue_id,
      lat: v.latitude!,
      lng: v.longitude!,
      title: v.name
    }));

  const allMarkers = myLocation
    ? [
      ...venueMarkers,
      {
        id: -1, // 내 위치
        lat: myLocation.lat,
        lng: myLocation.lng,
        title: "내 위치"
      }
    ]
    : venueMarkers;

  // 일반 마커와 선택된 마커 SVG 생성 (크기만 다름, 라벨 없음)
  const pinSvg = makeMarkerSVG(28);
  const selectedPinSvg = makeMarkerSVG(34);

  // 3개씩 묶어서 행(row) 단위로 분리
  const rows: NearbyPerformanceResponse[][] = [];
  for (let i = 0; i < performances.length; i += 3) {
    rows.push(performances.slice(i, i + 3));
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <NaverMapWebView
          height={MAP_HEIGHT}
          markers={allMarkers}
          center={mapCenter}
          zoom={mapZoom}
          myLocation={myLocation}
          onMarkerPress={handleMarkerPress}
          onSearchInMap={handleMapSearchInBounds}
          pinSvg={pinSvg}
          selectedPinSvg={selectedPinSvg}
          selectedId={selectedVenue?.venue_id}
        />

        {initialLocationLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Theme.colors.themeOrange} />
            <Text style={styles.loadingText}>현재 위치를 불러오는 중...</Text>
          </View>
        )}

        <TouchableOpacity style={styles.searchButton} onPress={onSearchCurrentMap}>
          <IcRefresh width={Theme.iconSizes.xs} height={Theme.iconSizes.xs} fill={Theme.colors.themeOrange} />
          <Text style={styles.searchButtonText}>현 지도에서 검색</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.myLocationButton} onPress={goToMyLocation}>
          <IcMyLocation width={Theme.iconSizes.md} height={Theme.iconSizes.md} fill={Theme.colors.darkGray} />
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.nowText}>{nowTime} 이후 공연</Text>
        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.themeOrange} style={{ marginTop: 20 }} />
        ) : performances.length === 0 ? (
          <Text style={styles.emptyText}>현재 지도 범위에 공연이 없습니다.</Text>
        ) : (
          <FlatList
            ref={listRef}
            data={rows}
            keyExtractor={(_, rowIndex) => rowIndex.toString()}
            renderItem={({ item: rowItems, index: rowIndex }) => (
              <>
                <View style={{ flexDirection: "row", marginBottom: Theme.spacing.sm }}>
                  {rowItems.map((item, colIndex) => (
                    <View key={item.venue_id} style={{ flex: 1 / 3, paddingHorizontal: 4 }}>
                      <PerformanceCard
                        type="location"
                        title={item.name}
                        date={item.performance[0]?.time ? formatTime(item.performance[0].time) : undefined}
                        posterUrl={item.performance[0]?.image_url || ""}
                        onPress={() => handleCardPress(item, rowIndex * 3 + colIndex)}
                        selected={selectedVenue?.venue_id === item.venue_id}
                      />
                    </View>
                  ))}
                </View>

                {selectedVenue &&
                  rowItems.some((c) => c.venue_id === selectedVenue.venue_id) &&
                  venueDetailPerformances.length > 0 && (
                    <View style={{ width: "100%", marginVertical: Theme.spacing.sm }}>
                      {venueDetailPerformances.map((p) => (
                        <SelectedPerformanceCard
                          key={p.performance_id}
                          venueId={selectedVenue.venue_id.toString()}
                          title={p.title}
                          name={selectedVenue.name}
                          address={p.address}
                          time={formatTime(p.time)}
                          posterUrl={p.image_url || ""}
                        />
                      ))}
                    </View>
                  )}
              </>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.white },
  mapContainer: { height: "45%" },
  emptyText: {
    textAlign: "center",
    padding: Theme.spacing.lg,
    fontSize: Theme.fontSizes.sm,
    fontWeight: Theme.fontWeights.regular,
    color: Theme.colors.gray,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: Theme.spacing.md,
    alignSelf: "center",
    backgroundColor: Theme.colors.white,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  searchButtonText: {
    color: Theme.colors.themeOrange,
    fontWeight: Theme.fontWeights.semibold,
    fontSize: Theme.fontSizes.sm,
    marginLeft: Theme.spacing.sm,
  },
  myLocationButton: {
    position: "absolute",
    bottom: Theme.spacing.md,
    right: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
    padding: 8,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  listContainer: {
    flex: 1,
    padding: Theme.spacing.md,
  },
  nowText: {
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.semibold,
    color: Theme.colors.black,
    marginBottom: Theme.spacing.sm,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  loadingText: {
    marginTop: Theme.spacing.sm,
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.medium,
    color: Theme.colors.darkGray,
  },
});