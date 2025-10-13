// app/(tabs)/venue/[id].tsx
import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    Pressable,
    FlatList,
    Linking,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import * as Clipboard from "expo-clipboard";

import NaverMapWebView from "@/components/maps/NaverMapWebView";
import Theme from "@/constants/Theme";
import PerformanceCard from "@/components/cards/PerformanceCard";
import ReviewPrevCard from "@/components/cards/ReviewPrevCard";
import IcClipboard from "@/assets/icons/ic-clipboard.svg";
import { getDateFromDateString } from "@/utils/dateUtils";

import { fetchVenueDetail } from "@/api/VenueApi";
import { fetchVenueReviewList } from "@/api/ReviewApi";
import { VenueDetailResponse } from "@/types/venue";
import { NormalizedReview } from "@/types/review";

type RouteParams = { id: string };

// 마커 SVG (초록색 음표)
const makeMarkerSVG = (size: number) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 -960 960 960">
  <circle cx="480" cy="-480" r="400" fill="#3C9C68"/>
  <path 
    d="M400-240q50 0 85-35t35-85v-280h120v-80H460v256q-14-8-29-12t-31-4q-50 0-85 35t-35 85q0 50 35 85t85 35Zm80 160q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"
    fill="#FAFAFA"
  />
  <circle cx="480" cy="-480" r="400" fill="none" stroke="#3C9C68" stroke-width="50"/>
</svg>
`.trim();

export default function VenueDetailPage() {
    const route = useRoute();
    const router = useRouter();
    const { id } = route.params as RouteParams;

    const [venue, setVenue] = useState<VenueDetailResponse | null>(null);
    const [reviews, setReviews] = useState<NormalizedReview[]>([]);

    useEffect(() => {
        const loadVenueData = async () => {
            try {
                const venueData = await fetchVenueDetail(Number(id));
                setVenue(venueData);

                const reviewData = await fetchVenueReviewList(Number(id), { page: 1, size: 10 });
                setReviews(reviewData.items);
            } catch (err) {
                console.error("공연장 데이터 로드 실패:", err);
            }
        };
        loadVenueData();
    }, [id]);

    if (!venue) return <Text>Loading...</Text>;

    // 지도용 마커 데이터
    const mapMarkers = venue.latitude && venue.longitude ? [{
    id: venue.id,
    lat: Number(venue.latitude),
    lng: Number(venue.longitude),
    title: venue.name,
    }] : [];

    const mapCenter = venue.latitude && venue.longitude ? {
        lat: venue.latitude,
        lng: venue.longitude
    } : { lat: 37.5665, lng: 126.978 };

    const markerSvg = makeMarkerSVG(28);
    console.log('🎨 markerSvg:', markerSvg);

    console.log('🎯 mapMarkers:', mapMarkers);
    console.log('🗺️ mapCenter:', mapCenter);

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                {/* 상단 공연장 정보 */}
                <View style={styles.topSection}>
                    <Image 
                        source={venue.image_url ? { uri: venue.image_url } : require('@/assets/images/modie-sample.png')} 
                        style={styles.profile} 
                    />
                    <View style={styles.venueInfo}>
                        <Text style={styles.venueName}>{venue.name}</Text>
                        {venue.description && (
                            <Text style={styles.venueDescription}>{venue.description}</Text>
                        )}
                    </View>
                </View>

                <View style={styles.separator} />

                <View style={styles.bottomSection}>
                    {/* 인스타그램 */}
                    {venue.instagram_account && (
                        <View style={styles.row}>
                            <Text style={styles.label}>인스타그램</Text>
                            <Pressable
                                onPress={() =>
                                    Linking.openURL(
                                        `https://www.instagram.com/${venue.instagram_account}`
                                    )
                                }
                            >
                                <Text style={styles.link}>@{venue.instagram_account}</Text>
                            </Pressable>
                        </View>
                    )}

                    {/* 주소 */}
                    {venue.address && (
                        <View style={styles.row}>
                            <Text style={styles.label}>주소</Text>
                            <View style={styles.valueWithIcon}>
                                <Text style={styles.value} numberOfLines={2} ellipsizeMode="tail">
                                    {venue.address?.trim() || "-"}
                                </Text>
                                <Pressable
                                    onPress={async () => {
                                        await Clipboard.setStringAsync(venue.address);
                                        Toast.show({
                                            type: "success",
                                            text1: "주소 복사 완료",
                                            position: "bottom",
                                            visibilityTime: 1500,
                                            autoHide: true,
                                        });
                                    }}
                                    style={styles.clipboardIcon}
                                >
                                    <IcClipboard width={Theme.iconSizes.sm} height={Theme.iconSizes.sm} />
                                </Pressable>
                            </View>
                        </View>
                    )}

                    {/* 지도 (WebView) */}
                    {venue.latitude && venue.longitude && (
                        <View style={styles.mapContainer}>
                            <NaverMapWebView
                                height={200}
                                markers={mapMarkers}
                                center={mapCenter}
                                zoom={16}
                                pinSvg={markerSvg}
                            />
                        </View>
                    )}

                    {/* 예정 공연 */}
                    <View style={styles.rowColumn}>
                        <Text style={styles.label}>예정 공연</Text>
                        {venue.upcomingPerformance?.length ? (
                            <FlatList
                                data={(venue.upcomingPerformance ?? []).map(p => ({
                                    id: p.id.toString(),
                                    title: p.title,
                                    date: p.date ?? "",
                                    posterUrl: p.image_url,
                                }))}
                                renderItem={({ item }) => (
                                    <PerformanceCard
                                        type="history"
                                        title={item.title}
                                        date={getDateFromDateString(item.date)}
                                        posterUrl={item.posterUrl}
                                        onPress={() => router.push(`/performance/${item.id}`)}
                                    />
                                )}
                                keyExtractor={(item) => item.id.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                            />
                        ) : (
                            <Text style={styles.noPerformanceText}>
                                예정된 공연이 없습니다.
                            </Text>
                        )}
                    </View>

                    {/* 지난 공연 */}
                    <View style={styles.rowColumn}>
                        <Text style={styles.label}>지난 공연</Text>
                        {venue.pastPerformance?.length ? (
                            <FlatList
                                data={(venue.pastPerformance ?? []).map(p => ({
                                    id: p.id.toString(),
                                    title: p.title,
                                    date: p.date ?? "",
                                    posterUrl: p.image_url,
                                }))}
                                renderItem={({ item }) => (
                                    <PerformanceCard
                                        type="history"
                                        title={item.title}
                                        date={getDateFromDateString(item.date)}
                                        posterUrl={item.posterUrl}
                                        onPress={() => router.push(`/performance/${item.id}`)}
                                    />
                                )}
                                keyExtractor={(item) => item.id.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                            />
                        ) : (
                            <Text style={styles.noPerformanceText}>
                                지난 공연이 없습니다.
                            </Text>
                        )}
                    </View>

                    {/* 리뷰 */}
                    <View style={styles.rowColumn}>
                        <Text style={styles.label}>리뷰</Text>

                        <FlatList
                            data={reviews.slice(0, 2)}
                            renderItem={({ item }) => (
                                <ReviewPrevCard
                                    userProfile={item.profile_url}
                                    userName={item.author || "익명"}
                                    content={item.text}
                                />
                            )}
                            keyExtractor={(item) => item.id.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            ListFooterComponent={
                                <ReviewPrevCard
                                    isMoreCard
                                    onPress={() => router.push(`/venue/${id}/reviews`)}
                                />
                            }
                            contentContainerStyle={{ paddingVertical: Theme.spacing.sm }}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.white },
    topSection: { flexDirection: "row", alignItems: "center", padding: Theme.spacing.md },
    profile: { 
        width: 90, 
        height: 90, 
        borderRadius: 45, 
        marginRight: Theme.spacing.md, 
        borderWidth: 1, 
        borderColor: Theme.colors.lightGray 
    },
    venueInfo: { flexDirection: "column", flex: 1 },
    venueName: { 
        fontWeight: Theme.fontWeights.bold, 
        fontSize: Theme.fontSizes.lg, 
        color: Theme.colors.black 
    },
    venueDescription: { 
        flexShrink: 1, 
        flexWrap: "wrap", 
        fontWeight: Theme.fontWeights.light, 
        marginTop: Theme.spacing.xs, 
        color: Theme.colors.darkGray 
    },
    separator: { 
        borderBottomWidth: 1, 
        borderBottomColor: Theme.colors.lightGray 
    },
    bottomSection: { padding: Theme.spacing.md },
    row: { flexDirection: "row", alignItems: "center", marginBottom: Theme.spacing.md, },
    rowColumn: { marginBottom: Theme.spacing.md },
    label: { 
        width: "25%", 
        fontSize: Theme.fontSizes.base, 
        fontWeight: Theme.fontWeights.semibold,
        marginVertical: Theme.spacing.sm 
    },
    valueWithIcon: { flex: 1, flexDirection: "row", alignItems: "center" },
    value: { 
        flex: 1, 
        fontSize: Theme.fontSizes.base, 
        color: Theme.colors.black, 
        marginRight: Theme.spacing.sm 
    },
    link: { fontSize: Theme.fontSizes.base, textDecorationLine: "underline" },
    clipboardIcon: { marginLeft: Theme.spacing.xs },
    mapContainer: { 
        width: "100%", 
        marginBottom: Theme.spacing.md,
        borderRadius: 8,
        overflow: "hidden"
    },
    noPerformanceText: { 
        fontSize: Theme.fontSizes.base, 
        color: Theme.colors.gray 
    },
});