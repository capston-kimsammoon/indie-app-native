// app/(tabs)/performance/[id].tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    Pressable,
    FlatList,
    Linking,
    Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { fetchPerformanceDetail } from "@/api/PerformanceApi";
import { like, unlike, TYPE_PERFORMANCE as TYPE_LIKE_PERF } from "@/api/LikeApi";
import { enableAlert, disableAlert, TYPE_PERFORMANCE as TYPE_ALERT_PERF } from "@/api/AlertApi";

import { PerformanceDetailResponse } from "@/types/performance";
import Theme from "@/constants/Theme";
import { formatDateTime, calcDDay } from "@/utils/dateUtils";

import IcHeartOutline from "@/assets/icons/ic-heart-outline.svg";
import IcHeartFilled from "@/assets/icons/ic-heart-filled.svg";
import IcBellOff from "@/assets/icons/ic-bell-off.svg";
import IcBellOn from "@/assets/icons/ic-bell-on.svg";
import IcChevronRight from "@/assets/icons/ic-chevron-right.svg";

type RouteParams = { id: string };

export default function PerformanceDetailPage() {
    const route = useRoute();
    const router = useRouter();
    const { id } = route.params as RouteParams;

    const iconHeartSize = Theme.iconSizes.sm;
    const iconBellSize = Theme.iconSizes.xs;
    const iconChevronSize = Theme.iconSizes.xs;

    const [performance, setPerformance] = useState<PerformanceDetailResponse | null>(null);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isNotified, setIsNotified] = useState(false);

    // 공연 상세 조회
    useEffect(() => {
        const loadDetail = async () => {
            try {
                const data = await fetchPerformanceDetail(Number(id));
                setPerformance(data);
                setLiked(data.isLiked);
                setIsNotified(data.isAlarmed);
                setLikeCount(data.likeCount || 0);
            } catch (err) {
                console.error("공연 상세 조회 실패:", err);
            }
        };
        loadDetail();
    }, [id]);


    // 찜 ON/OFF
    const handleLikePress = async () => {
        if (!performance) return;

        try {
            if (!liked) {
                await like(TYPE_LIKE_PERF, performance.id);
                setLiked(true);
                setLikeCount(likeCount + 1);
            } else {
                await unlike(TYPE_LIKE_PERF, performance.id);
                setLiked(false);
                setLikeCount(likeCount - 1);
            }
        } catch (err) {
            console.error('찜 처리 실패:', err);
        }
    };

    // 예매 알림 버튼
    const handleNotifyPress = async () => {
        if (!performance) return;

        try {
            if (!isNotified) {
                await enableAlert(TYPE_ALERT_PERF, performance.id);
                setIsNotified(true);
            } else {
                await disableAlert(TYPE_ALERT_PERF, performance.id);
                setIsNotified(false);
            }
        } catch (err) {
            console.error('알림 처리 실패:', err);
        }
    };

    if (!performance) return <Text>Loading...</Text>;

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                {/* 상단 공연 정보 */}
                <View style={styles.topSection}>
                    <View style={styles.posterWrapper}>
                        <Image
                            source={{ uri: performance.posterUrl || "https://via.placeholder.com/90x120" }}
                            style={styles.poster}
                        />
                        {/* 찜 버튼 */}
                        <Pressable style={styles.likesBox} onPress={handleLikePress}>
                            {liked ? (
                                <IcHeartFilled width={iconHeartSize} height={iconHeartSize} />
                            ) : (
                                <IcHeartOutline width={iconHeartSize} height={iconHeartSize} />
                            )}
                            <Text style={styles.likeCount}>{likeCount.toLocaleString()}</Text>
                        </Pressable>
                    </View>

                    {/* 공연 텍스트 정보 */}
                    <View style={styles.topInfo}>
                        <Text style={styles.dday}>{performance.date && calcDDay(new Date(performance.date))}</Text>
                        <Text style={styles.title}>{performance.title}</Text>
                        {/* 예매 알림 버튼 */}
                        <Pressable style={styles.notifyButton} onPress={handleNotifyPress}>
                            <Text style={styles.notifyText}>예매알림</Text>
                            {isNotified ? (
                                <IcBellOn width={iconBellSize} height={iconBellSize} fill={Theme.colors.gray} />
                            ) : (
                                <IcBellOff width={iconBellSize} height={iconBellSize} fill={Theme.colors.gray} />
                            )}
                        </Pressable>
                    </View>
                </View>

                <View style={styles.separator} />

                {/* 공연일시 */}
                <View style={styles.row}>
                    <Text style={styles.label}>공연일시</Text>
                    <Text style={styles.value}>
                        {formatDateTime(new Date(performance.date))}
                    </Text>
                </View>

                {/* 공연장 */}
                <View style={styles.row}>
                    <Text style={styles.label}>공연장</Text>
                    <View style={styles.valueWithIcon}>
                        <Text style={styles.value}>{performance.venue}</Text>
                        <Pressable onPress={() => router.push(`/venue/${performance.venueId}`)}>
                            <IcChevronRight width={iconChevronSize} height={iconChevronSize} />
                        </Pressable>
                    </View>
                </View>

                {/* 출연진 */}
                <View style={styles.rowColumn}>
                    <Text style={styles.label}>출연진</Text>
                    <FlatList
                        data={performance.artists}
                        horizontal
                        keyExtractor={(item) => item.id.toString()}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <Pressable
                                style={styles.artist}
                                onPress={() => router.push(`/artist/${item.id}`)}
                            >
                                <Image
                                    source={{ uri: item.image_url || "https://via.placeholder.com/60" }}
                                    style={styles.profile}
                                />
                                <Text style={styles.artistName}>{item.name}</Text>
                            </Pressable>
                        )}
                    />
                </View>

                {/* 티켓가격 */}
                <View style={styles.row}>
                    <Text style={styles.label}>티켓가격</Text>
                    <Text style={styles.value}>
                        {performance.price ? Number(performance.price.replace(/[^0-9]/g, '')).toLocaleString() + "원" : "-"}
                    </Text>
                </View>

                {/* 티켓오픈 */}
                {performance.ticket_open_date && (
                    <View style={styles.row}>
                        <Text style={styles.label}>티켓오픈</Text>
                        <Text style={styles.value}>
                            {formatDateTime(
                                new Date(performance.ticket_open_date),
                                performance.ticket_open_time || undefined
                            )}
                        </Text>
                    </View>
                )}

                {/* 상세정보(인스타 게시물) */}
                {performance.shortcode && (
                    <View style={styles.row}>
                        <Text style={styles.label}>상세정보</Text>
                        <Pressable onPress={() => Linking.openURL(`https://www.instagram.com/p/${performance.shortcode}`)}>
                            <Text style={styles.link}>공연 게시물 →</Text>
                        </Pressable>
                    </View>
                )}

                {/* 예매링크 */}
                {performance.detailLink && (
                    <View style={styles.row}>
                        <Text style={styles.label}>예매링크</Text>
                        <Pressable onPress={() => Linking.openURL(performance.detailLink)}>
                            <Text style={styles.link}>예매링크 →</Text>
                        </Pressable>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.white },
    topSection: { flexDirection: "row", padding: Theme.spacing.md },
    posterWrapper: { alignItems: "center", marginRight: Theme.spacing.lg },
    poster: {
        width: 120,
        aspectRatio: 3 / 4,
        borderRadius: 8
    },
    likesBox: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Theme.colors.lightGray,
        borderRadius: 20,
        paddingHorizontal: Theme.spacing.sm,
        paddingVertical: Theme.spacing.xs,
        marginTop: Theme.spacing.sm,
    },
    likeCount: { fontSize: Theme.fontSizes.sm, color: Theme.colors.gray, marginLeft: Theme.spacing.xs },
    topInfo: { flex: 1 },
    dday: { fontSize: Theme.fontSizes.sm, fontWeight: Theme.fontWeights.medium, color: Theme.colors.gray, marginVertical: Theme.spacing.xs },
    title: { fontSize: Theme.fontSizes.lg, fontWeight: Theme.fontWeights.semibold, color: Theme.colors.black, marginVertical: Theme.spacing.xs },
    notifyButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: Theme.spacing.sm,
        paddingVertical: Theme.spacing.xs,
        borderWidth: 1,
        borderRadius: 20,
        borderColor: Theme.colors.lightGray,
        alignSelf: "flex-start",
        marginTop: Theme.spacing.sm,
    },
    notifyText: { color: Theme.colors.gray, marginRight: Theme.spacing.xs },
    separator: { borderBottomWidth: 1, borderBottomColor: Theme.colors.lightGray, marginBottom: Theme.spacing.md },
    row: { flexDirection: "row", alignItems: "center", padding: Theme.spacing.md },
    rowColumn: { padding: Theme.spacing.md },
    label: { width: "25%", fontSize: Theme.fontSizes.base, fontWeight: Theme.fontWeights.semibold },
    valueWithIcon: { flex: 1, flexDirection: "row", alignItems: "center" },
    value: { fontSize: Theme.fontSizes.base, color: Theme.colors.black, marginRight: Theme.spacing.xs },
    artist: { alignItems: "center", marginRight: Theme.spacing.md, marginVertical: Theme.spacing.md },
    profile: { width: 60, height: 60, borderRadius: 30, margin: Theme.spacing.sm },
    artistName: { fontSize: Theme.fontSizes.base, color: Theme.colors.darkGray, textAlign: "center" },
    link: { fontSize: Theme.fontSizes.base, textDecorationLine: "underline" },
});
