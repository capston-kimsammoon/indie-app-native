// /app/(tabs)/performance/index.tsx
import React, { useState } from "react";
import { View, Text, FlatList } from "react-native";
import FilterButton from "@/components/filters/FilterButton";
import SortFilterModal from "@/components/filters/SortFilterModal";
import RegionFilterModal from "@/components/filters/RegionFilterModal";

import Theme from "@/constants/Theme";

type Performance = {
  id: string;
  title: string;
  region: string;
};

const MOCK_PERFORMANCES: Performance[] = [
  { id: "2", title: "aaa", region: "경기" },
  { id: "3", title: "bbb", region: "부산" },
  { id: "4", title: "ccc", region: "서울" },
];

export default function PerformanceListPage() {
  const [sort, setSort] = useState("최근등록순");
  const [regions, setRegions] = useState<string[]>(["전체"]);

  const [sortVisible, setSortVisible] = useState(false);
  const [regionVisible, setRegionVisible] = useState(false);

  const getRegionLabel = () => {
    if (regions.includes("전체") || regions.length === 0) return "지역: 전체";
    if (regions.length <= 2) return `지역: ${regions.join(", ")}`;
    return `지역: ${regions.slice(0, 2).join(", ")} 외 ${regions.length - 2}곳`;
  };

  const filteredPerformances = MOCK_PERFORMANCES.filter((p) => {
    if (regions.includes("전체")) return true;
    return regions.includes(p.region);
  });

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.white }}>
      {/* 필터 버튼 */}
      <View style={{ flexDirection: "row", padding: 12, borderBottomWidth: 1, borderColor: Theme.colors.lightGray }}>
        <FilterButton label={`${sort}`} onPress={() => setSortVisible(true)} />
        <FilterButton label={getRegionLabel()} onPress={() => setRegionVisible(true)} />
      </View>

      {/* 공연 목록 */}
      <FlatList
        data={filteredPerformances}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: Theme.spacing.md, borderBottomWidth: 1, borderColor:Theme.colors.lightGray }}>
            <Text style={{ fontSize: Theme.fontSizes.base, fontWeight: Theme.fontWeights.bold }}>{item.title}</Text>
            <Text style={{  }}>{item.region}</Text>
          </View>
        )}
      />

      {/* 정렬 모달 */}
      <SortFilterModal
        visible={sortVisible}
        onClose={() => setSortVisible(false)}
        selectedSort={sort}
        onChange={(selected) => setSort(selected)}
      />

      {/* 지역 모달 */}
      <RegionFilterModal
        visible={regionVisible}
        selectedRegions={regions}
        onClose={() => setRegionVisible(false)}
        onChange={(newRegions) => setRegions(newRegions)}
      />
    </View>
  );
}
