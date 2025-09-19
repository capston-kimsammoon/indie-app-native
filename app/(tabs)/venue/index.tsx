// /app/(tabs)/performance/index.tsx
import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";

import FilterButton from "@/components/filters/FilterButton";
import RegionFilterModal from "@/components/filters/RegionFilterModal";
import PerformanceCard from "@/components/cards/PerformanceCard";

import Theme from "@/constants/Theme";

type Venue = {
    id: string,
    name: string,
    region: string,
    profileUrl: string,
};

const MOCK_VENUES: Venue[] = [
    { id: "1", name: "언드", region: "서울", profileUrl: "https://picsum.photos/100/100" },
    { id: "2", name: "우주정거장", region: "인천", profileUrl: "https://picsum.photos/100/100" },
    { id: "3", name: "언드", region: "경기", profileUrl: "https://picsum.photos/100/100" },
    { id: "4", name: "언드", region: "서울", profileUrl: "https://picsum.photos/100/100" },
    { id: "5", name: "언드", region: "서울", profileUrl: "https://picsum.photos/100/100" },
];

export default function PerformanceListPage() {
    const navigation = useNavigation();
    const router = useRouter();
    const [regions, setRegions] = useState<string[]>(["전체"]);

    const [regionVisible, setRegionVisible] = useState(false);

    const getRegionLabel = () => {
        if (regions.includes("전체") || regions.length === 0) return "지역: 전체";
        if (regions.length <= 2) return `지역: ${regions.join(", ")}`;
        return `지역: ${regions.slice(0, 2).join(", ")} 외 ${regions.length - 2}곳`;
    };

    const filteredVenues = MOCK_VENUES.filter((p) => {
        if (regions.includes("전체")) return true;
        return regions.includes(p.region);
    });

    return (
        <View style={styles.container}>
            <View style={styles.filterRow}>
                <FilterButton label={getRegionLabel()} onPress={() => setRegionVisible(true)} />
            </View>


            {/* 공연 목록 */}
            <FlatList
                data={filteredVenues}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Pressable
                        style={styles.venueCard}
                        onPress={() => router.push(`/venue/${item.id}`)}
                    >
                        <Image source={{uri: item.profileUrl}} style={styles.venueImage} />
                        <Text style={styles.venueName}>{item.name}</Text>
                    </Pressable>
                )}
                ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                )}
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
    flexSpacer: {
        flex: 1,
    },
    separator: {
        height: 1,
        backgroundColor: Theme.colors.lightGray,
    },
    venueCard: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: Theme.spacing.sm,
        paddingHorizontal: Theme.spacing.md,
    },
    venueImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: Theme.spacing.md,
    },
    venueName: {
        fontSize: Theme.fontSizes.base,
        fontWeight: Theme.fontWeights.medium,
        color: Theme.colors.black,
    },
});
