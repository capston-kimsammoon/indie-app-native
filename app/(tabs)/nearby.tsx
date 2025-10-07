import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Dimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";
import PerformanceCard from "@/components/cards/PerformanceCard";
import SelectedPerformanceCard from "@/components/cards/SelectedPerformanceCard";
import IcRefresh from "@/assets/icons/ic-refresh.svg";
import IcMyLocation from "@/assets/icons/ic-mylocation.svg";
import IcMarker from "@/assets/icons/ic-marker.svg";
import { getNowTime, formatTime } from "@/utils/dateUtils";
import Theme from "@/constants/Theme";
import NearbyApi from "@/api/NearbyApi";
import { NearbyPerformanceResponse, VenuePerformanceItem, PerformanceBoundsRequest } from "@/types/nearby";
import * as Location from "expo-location";

const SCREEN_WIDTH = Dimensions.get("window").width;

type VenueMarkerProps = {
  venue: NearbyPerformanceResponse;
  selected: boolean;
  onPress: (venue: NearbyPerformanceResponse, index: number) => void;
  index: number;
};

const VenueMarker = React.memo(
  ({ venue, selected, onPress, index }: VenueMarkerProps) => (
    <Marker
      key={selected ? `${venue.venue_id}-selected` : venue.venue_id}
      coordinate={{ latitude: venue.latitude!, longitude: venue.longitude! }}
      onPress={() => onPress(venue, index)}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={{ alignItems: "center" }}>
        {selected && (
          <View style={styles.markerLabelContainer}>
            <Text style={styles.markerLabelText} numberOfLines={1}>
              {venue.name}
            </Text>
          </View>
        )}
        <IcMarker width={Theme.iconSizes.lg} height={Theme.iconSizes.lg} />
      </View>
    </Marker>
  ),
  (prev, next) =>
    prev.selected === next.selected &&
    prev.venue.latitude === next.venue.latitude &&
    prev.venue.longitude === next.venue.longitude
);

export default function TabNearbyScreen() {
  const mapRef = useRef<MapView>(null);
  const listRef = useRef<FlatList>(null);

  const [performances, setPerformances] = useState<NearbyPerformanceResponse[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<NearbyPerformanceResponse | null>(null);
  const [venueDetailPerformances, setVenueDetailPerformances] = useState<VenuePerformanceItem[]>([]);
  const [region, setRegion] = useState({ latitude: 37.5665, longitude: 126.978, latitudeDelta: 0.05, longitudeDelta: 0.05 });
  const [loading, setLoading] = useState(false);
  const [nowTime, setNowTime] = useState(getNowTime());

  // 초기 위치 및 공연 조회
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        setNowTime(getNowTime());

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const newRegion = { latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 500);

        const bounds = { sw_lat: latitude - 0.01, sw_lng: longitude - 0.01, ne_lat: latitude + 0.01, ne_lng: longitude + 0.01 };
        fetchPerformancesInBounds(bounds);
      } catch (err) {
        console.error("초기 위치/공연 조회 실패:", err);
      }
    })();
  }, []);

  const fetchPerformancesInBounds = async (bounds: PerformanceBoundsRequest) => {
    setLoading(true);
    try {
      const data = await NearbyApi.getPerformancesInBounds(bounds);
      setPerformances(data);
    } catch (err) {
      console.error("지도 공연 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVenueSelect = useCallback(async (venue: NearbyPerformanceResponse, index: number) => {
    setSelectedVenue(venue);
    mapRef.current?.animateCamera(
      { center: { latitude: venue.latitude!, longitude: venue.longitude! }, zoom: 16 },
      { duration: 100 }
    );

    try {
      const data = await NearbyApi.getVenuePerformances(venue.venue_id, new Date().toISOString());
      setVenueDetailPerformances(data);
    } catch (err) {
      console.error("공연장 상세 조회 실패:", err);
      setVenueDetailPerformances([]);
    }

    // 선택된 공연 카드가 속한 행(row)으로 스크롤
    if (listRef.current) {
      const rowIndex = Math.floor(index / 3);
      const rowHeight = 250 + Theme.spacing.sm; // 카드 높이 + margin
      listRef.current.scrollToOffset({ offset: rowIndex * rowHeight, animated: true });
    }
  }, []);

  const handleCardPress = (venue: NearbyPerformanceResponse, index: number) => handleVenueSelect(venue, index);

  const goToMyLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      mapRef.current?.animateCamera({ center: { latitude, longitude }, zoom: 16 });
    } catch (err) {
      console.error("현재 위치 가져오기 실패:", err);
    }
  };

  const onSearchCurrentMap = async () => {
    if (!mapRef.current) return;
    setNowTime(getNowTime());
    const bounds = await mapRef.current.getMapBoundaries();
    fetchPerformancesInBounds({
      sw_lat: bounds.southWest.latitude,
      sw_lng: bounds.southWest.longitude,
      ne_lat: bounds.northEast.latitude,
      ne_lng: bounds.northEast.longitude,
    });
  };

  // 3개씩 묶어서 행(row) 단위로 분리
  const rows: NearbyPerformanceResponse[][] = [];
  for (let i = 0; i < performances.length; i += 3) {
    rows.push(performances.slice(i, i + 3));
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView ref={mapRef} style={styles.map} initialRegion={region} showsUserLocation={true}>
          {performances.map((v, index) => (
            <VenueMarker
              key={v.venue_id}
              venue={v}
              selected={selectedVenue?.venue_id === v.venue_id}
              onPress={handleVenueSelect}
              index={index}
            />
          ))}
        </MapView>

        <Pressable style={styles.searchButton} onPress={onSearchCurrentMap}>
          <IcRefresh width={Theme.iconSizes.xs} height={Theme.iconSizes.xs} fill={Theme.colors.themeOrange} />
          <Text style={styles.searchButtonText}>현 지도에서 검색</Text>
        </Pressable>

        <Pressable style={styles.myLocationButton} onPress={goToMyLocation}>
          <IcMyLocation width={Theme.iconSizes.md} height={Theme.iconSizes.md} fill={Theme.colors.darkGray} />
        </Pressable>
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

                {/* 선택된 카드가 이 행에 속하면 SelectedPerformanceCard 렌더 */}
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
  map: { flex: 1 },
  emptyText: {
    textAlign: "center",
    padding: Theme.spacing.lg,
    fontSize: Theme.fontSizes.sm,
    fontWeight: Theme.fontWeights.regular,
    color: Theme.colors.gray,
  },
  markerLabelContainer: {
    backgroundColor: Theme.colors.white,
    borderRadius: 6,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    marginBottom: Theme.spacing.xs / 2,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
  },
  markerLabelText: {
    fontSize: Theme.fontSizes.xs,
    fontWeight: Theme.fontWeights.medium,
    color: Theme.colors.black,
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
});
