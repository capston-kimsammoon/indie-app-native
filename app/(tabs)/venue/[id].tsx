// app/(tabs)/venue/[id].tsx
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    Linking,
    Pressable,
    FlatList,
    Alert, Platform, ToastAndroid
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { NaverMapView, NaverMapMarkerOverlay } from "@mj-studio/react-native-naver-map";

import Header from "@/components/layout/Header";
import Theme from "@/constants/Theme";
import { formatDateTime, calcDDay } from "@/utils/dateUtils";
import * as Clipboard from 'expo-clipboard';
import PerformanceCard from "@/components/cards/PerformanceCard";
import ReviewCard from "@/components/cards/ReviewCard";
import IcClipboard from "@/assets/icons/ic-clipboard.svg";

type RouteParams = { id: string };

const MOCK_DETAIL = {
    id: 1,
    profleUrl: "https://picsum.photos/90/120",
    name: "언플러그드 홍대",
    instagramAccount: "unplugged_stage",
    address: "서울특별시 마포구 와우산로33길 26",
    latitude: 37.555639,
    longitude: 126.929180,

    upcomingPerformances: [
        { id: "1", title: "시간의 목소리", date: "2025-05-10", posterUrl: "https://picsum.photos/90/120"},
        { id: "2", title: "우리의 16번째 절기 ‘추분’", date: "2025-05-10", posterUrl: "https://picsum.photos/90/120"},
        { id: "3", title: "시간의 목소리", date: "2025-05-10", posterUrl: "https://picsum.photos/90/120"},
    ],
    pastPerformances: [
        { id: "1", title: "시간의 목소리~", date: "2025.05.10", posterUrl: "https://picsum.photos/90/120"},
        { id: "2", title: "우리의 16번째 절기 ‘추분’", date: "2025.05.10", posterUrl: "https://picsum.photos/90/120"},
        { id: "3", title: "시간의 목소리", date: "2025.05.10", posterUrl: "https://picsum.photos/90/120"},
    ],
    reviews: [
        { id: "1", content: "홍입에서 걸어서 10분도 안 걸림 홍입에서 걸어서 10분도 안 걸림 홍입에서 걸어서 10분도 안 걸림 홍입에서 걸어서 10분도 안 걸림", userName: "하츄핑", userProfile: "https://picsum.photos/100/100"},
        { id: "2", content: "여기 화장실 깨끗해서 좋아요", userName: "하츄핑", userProfile: "https://picsum.photos/100/100"},
    ]
};

export default function VenueDetailPage() {
    const route = useRoute();
    const router = useRouter();
    const { id } = route.params as RouteParams;

    const venue = MOCK_DETAIL;

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                {/* 상단 공연 정보 */}
                <View style={styles.topSection}>
                    <Image
                        source={{uri: venue.profleUrl}}
                        style={styles.profile}
                    />
                    <Text style={styles.venueName}>{venue.name}</Text>
                </View>

                <View style={styles.separator} />

                <View style={styles.bottomSection}>
                    <View style={styles.row}>
                        <Text style={styles.label}>인스타그램</Text>
                        <Text style={styles.value}>@{venue.instagramAccount}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>주소</Text>
                        <View style={styles.valueWithIcon}>
                            <Text
                                style={styles.value}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
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

                    {/* 네이버 지도 */}
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

                    <View style={styles.rowColumn}>
                        <Text style={styles.label}>예정 공연</Text>
                        <FlatList
                            data={venue.upcomingPerformances}
                            renderItem={({ item }) => (
                                <PerformanceCard
                                    type="history"
                                    title={item.title}
                                    date={item.date}
                                    posterUrl={item.posterUrl}
                                    onPress={() => router.push(`/performance/${item.id}`)}
                                />
                            )}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.list}
                        />
                    </View>

                    <View style={styles.rowColumn}>
                        <Text style={styles.label}>지난 공연</Text>
                        <FlatList
                            data={venue.upcomingPerformances}
                            renderItem={({ item }) => (
                                <PerformanceCard
                                    type="history"
                                    title={item.title}
                                    date={item.date}
                                    posterUrl={item.posterUrl}
                                    onPress={() => router.push(`/performance/${item.id}`)}
                                />
                            )}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.list}
                        />
                    </View>

                    <View style={styles.rowColumn}>
                        <Text style={styles.label}>리뷰</Text>
                        <FlatList
                            data={venue.reviews.slice(0, 2)} // 최신순 2개만
                            renderItem={({ item }) => (
                                <ReviewCard
                                    userProfile={item.userProfile}
                                    userName={item.userName}
                                    content={item.content}
                                />
                            )}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            ListFooterComponent={
                                <ReviewCard
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
    container: {
        flex: 1,
        backgroundColor: Theme.colors.white
    },

    // 상단 섹션
    topSection: {
        flexDirection: "row",
        alignItems: "center",
        padding: Theme.spacing.md,
    },
    profile: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: Theme.spacing.md,
    },
    venueName: {
        fontWeight: Theme.fontWeights.semibold,
        fontSize: Theme.fontSizes.lg,
        color: Theme.colors.black,
    },

    separator: {
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.lightGray,
        marginBottom: Theme.spacing.md,
    },

    // 상세 정보
    bottomSection: {
        //padding: Theme.spacing.md,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        padding: Theme.spacing.md,
    },
    rowColumn: {
        padding: Theme.spacing.md,
    },
    label: {
        width: "25%",
        fontSize: Theme.fontSizes.base,
        fontWeight: Theme.fontWeights.semibold,
    },
    valueWithIcon: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    value: {
        flex: 1,
        fontSize: Theme.fontSizes.base,
        color: Theme.colors.black,
        marginRight: Theme.spacing.sm,
    },
    clipboardIcon: {
        marginLeft: Theme.spacing.xs,
    },

    list: {
        marginRight: Theme.spacing.md,
    },
    mapContainer: {
        height: 200,
        marginHorizontal: Theme.spacing.md,
        marginBottom: Theme.spacing.md,
        overflow: 'hidden',
    },
    map: {
        flex: 1,
    },
});
