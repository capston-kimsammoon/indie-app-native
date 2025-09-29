import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";

import FilterButton from "@/components/filters/FilterButton";
import RegionFilterModal from "@/components/filters/RegionFilterModal";
import VenueCard from "@/components/cards/VenueCard";
import Theme from "@/constants/Theme";

import { Venue } from "@/types/venue";
import { fetchVenues } from "@/api/VenueApi";

export default function VenueListPage() {
  const navigation = useNavigation();
  const router = useRouter();

  const [regions, setRegions] = useState<string[]>(["전체"]);
  const [regionVisible, setRegionVisible] = useState(false);

  const [venues, setVenues] = useState<Venue[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const getRegionLabel = () => {
    if (regions.includes("전체") || regions.length === 0) return "지역: 전체";
    if (regions.length <= 2) return `지역: ${regions.join(", ")}`;
    return `지역: ${regions.slice(0, 2).join(", ")} 외 ${regions.length - 2}곳`;
  };

  const loadVenues = async (reset = false) => {
    try {
      setLoading(true);
      const selectedRegions = regions.includes("전체") ? undefined : regions; // 전체 배열 전달
      const data = await fetchVenues(reset ? 1 : page, 10, selectedRegions); 
      setVenues(reset ? data.venue : [...venues, ...data.venue]);
      setPage(data.page + 1);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadVenues(true); // 초기, 필터 변경 시 새로 불러오기
  }, [regions]);

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <FilterButton label={getRegionLabel()} onPress={() => setRegionVisible(true)} />
      </View>

      <FlatList
        data={venues}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <VenueCard
            id={item.id.toString()}
            name={item.name}
            region={item.region}
            profileUrl={item.image_url}
            onPress={() => router.push(`/venue/${item.id}`)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onEndReached={() => {
          if (!loading && page <= totalPages) loadVenues();
        }}
        ListFooterComponent={loading ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
      />

      <RegionFilterModal
        visible={regionVisible}
        selectedRegions={regions}
        onClose={() => setRegionVisible(false)}
        onChange={(newRegions) => {
          setRegions(newRegions);
          setPage(1);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: Theme.colors.lightGray,
  },
  separator: {
    height: 1,
    backgroundColor: Theme.colors.lightGray,
  },
});
