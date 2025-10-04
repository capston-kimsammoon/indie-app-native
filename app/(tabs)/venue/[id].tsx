// app/(tabs)/venue/[id].tsx
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    Pressable,
    FlatList,
    Linking
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { NaverMapView, NaverMapMarkerOverlay } from "@mj-studio/react-native-naver-map";

import Theme from "@/constants/Theme";
import * as Clipboard from "expo-clipboard";
import PerformanceCard from "@/components/cards/PerformanceCard";
import ReviewPrevCard from "@/components/cards/ReviewPrevCard";
import IcClipboard from "@/assets/icons/ic-clipboard.svg";
import { getDateFromDateString } from "@/utils/dateUtils";

import { fetchVenueDetail } from "@/api/VenueApi";
import { fetchVenueReviewList } from "@/api/ReviewApi";
import { VenueDetailResponse } from "@/types/venue";
import { ReviewItem, NormalizedReview } from "@/types/review";

type RouteParams = { id: string };

export default function VenueDetailPage() {
    const route = useRoute();
    const router = useRouter();
    const { id } = route.params as RouteParams;

    const [venue, setVenue] = useState<VenueDetailResponse | null>(null);
    const [reviews, setReviews] = useState<NormalizedReview[]>([]);

    useEffect(() => {
        const loadVenueData = async () => {
            try {
                // 공연장 상세 정보
                const venueData = await fetchVenueDetail(Number(id));
                setVenue(venueData);

                // 공연장 리뷰
                const reviewData = await fetchVenueReviewList(Number(id), { page: 1, size: 10 });
                setReviews(reviewData.items);
            } catch (err) {
                console.error("공연장 데이터 로드 실패:", err);
            }
        };

        loadVenueData();
    }, [id]);


    if (!venue) return <Text>Loading...</Text>;

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                {/* 상단 공연장 정보 */}
                <View style={styles.topSection}>
                    <Image source={venue.image_url ? { uri: venue.image_url } : require('@/assets/images/modie-sample.png')} style={styles.profile} />
                    <Text style={styles.venueName}>{venue.name}</Text>
                </View>

                <View style={styles.separator} />

                <View style={styles.bottomSection}>
                    {/* 인스타그램 */}
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

                    {/* 주소 */}
                    <View style={styles.row}>
                        <Text style={styles.label}>주소</Text>
                        <View style={styles.valueWithIcon}>
                            <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
                                {venue.address}
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

                    {/* 지도 */}
                    <View style={styles.mapContainer}>
                        <NaverMapView
                            style={styles.map}
                            center={{ latitude: venue.latitude, longitude: venue.longitude, zoom: 16 }}
                            scrollGesturesEnabled={false}
                            zoomGesturesEnabled={false}
                        >
                            <NaverMapMarkerOverlay
                                latitude={venue.latitude}
                                longitude={venue.longitude}
                                caption={{ text: venue.name }}
                            />
                        </NaverMapView>
                    </View>

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
                            data={reviews.slice(0, 2)} // 최대 2개만 보여줌
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
    profile: { width: 90, height: 90, borderRadius: 45, marginRight: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.lightGray },
    venueName: { fontWeight: Theme.fontWeights.bold, fontSize: Theme.fontSizes.lg, color: Theme.colors.black },
    separator: { borderBottomWidth: 1, borderBottomColor: Theme.colors.lightGray, },
    bottomSection: { padding: Theme.spacing.md },
    row: { flexDirection: "row", alignItems: "center", },
    rowColumn: { marginBottom: Theme.spacing.md },
    label: { width: "25%", fontSize: Theme.fontSizes.base, fontWeight: Theme.fontWeights.semibold, paddingVertical: Theme.spacing.md },
    valueWithIcon: { flex: 1, flexDirection: "row", alignItems: "center" },
    value: { flex: 1, fontSize: Theme.fontSizes.base, color: Theme.colors.black, marginRight: Theme.spacing.sm },
    link: { fontSize: Theme.fontSizes.base, textDecorationLine: "underline" },
    clipboardIcon: { marginLeft: Theme.spacing.xs },
    list: { marginRight: Theme.spacing.md },
    mapContainer: { height: 200, marginBottom: Theme.spacing.md, overflow: "hidden" },
    map: { flex: 1 },
    noPerformanceText: { fontSize: Theme.fontSizes.base, color: Theme.colors.gray, },

});
