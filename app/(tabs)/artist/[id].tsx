import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    Pressable,
    FlatList,
    Linking,
    ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";

import Theme from "@/constants/Theme";
import PerformanceCard from "@/components/cards/PerformanceCard";
import { getDateFromDateString } from "@/utils/dateUtils";
import { useArtists } from '@/context/ArtistContext';

import IcHeartOutline from "@/assets/icons/ic-heart-outline.svg";
import IcHeartFilled from "@/assets/icons/ic-heart-filled.svg";
import IcBellOff from "@/assets/icons/ic-bell-off.svg";
import IcBellOn from "@/assets/icons/ic-bell-on.svg";

import { fetchArtistDetail } from "@/api/ArtistApi";
import { like, unlike, TYPE_ARTIST as TYPE_LIKE_ARTIST } from "@/api/LikeApi";
import { enableAlert, disableAlert, TYPE_ARTIST as TYPE_ALERT_ARTIST } from "@/api/AlertApi";
import { ArtistDetailResponse } from "@/types/artist";
import { requireLogin } from "@/utils/auth";

type RouteParams = { id: string };

export default function ArtistDetailPage() {
    const route = useRoute();
    const router = useRouter();
    const { id } = route.params as RouteParams;

    const [artist, setArtist] = useState<ArtistDetailResponse | null>(null);
    const [liked, setLiked] = useState(false);
    const [isNotified, setIsNotified] = useState(false);
    const { artists, setArtists } = useArtists();

    const iconHeartSize = Theme.iconSizes.sm;
    const iconBellSize = Theme.iconSizes.xs;

    // 아티스트 상세 조회
    useEffect(() => {
        const loadDetail = async () => {
            try {
                const data = await fetchArtistDetail(Number(id));
                setArtist(data);
                setLiked(data.isLiked);
                setIsNotified(data.isNotified);
            } catch (err) {
                console.error("아티스트 상세 조회 실패:", err);
            }
        };
        loadDetail();
    }, [id]);

    // 찜 ON/OFF
    const handleLikePress = () => {
        requireLogin(async () => {
            if (!artist) return;
            const newLiked = !artist.isLiked;
            try {
                if (newLiked) await like(TYPE_LIKE_ARTIST, artist.id);
                else await unlike(TYPE_LIKE_ARTIST, artist.id);

                setLiked(newLiked);
                setArtist(prev => prev && { ...prev, isLiked: newLiked });
                setArtists(prev =>
                    prev.map(a => (a.id === artist.id ? { ...a, isLiked: newLiked } : a))
                );
            } catch (err: any) {
                console.error("찜 처리 실패:", err.response?.data || err.message);
                setArtist(prev => prev && { ...prev, isLiked: artist.isLiked }); // UI 롤백
            }
        });
    };

    // 알림 ON/OFF
    const handleNotifyPress = () => {
        requireLogin(async () => {
            if (!artist) return;
            try {
                if (!isNotified) {
                    await enableAlert(TYPE_ALERT_ARTIST, artist.id);
                    setIsNotified(true);
                } else {
                    await disableAlert(TYPE_ALERT_ARTIST, artist.id);
                    setIsNotified(false);
                }
            } catch (err) {
                console.error("알림 처리 실패:", err);
            }
        });
    };

    if (!artist)
        return <ActivityIndicator size="large" style={{ flex: 1 }} />;

    const profileImage = artist.image_url;

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                {/* 상단 아티스트 정보 */}
                <View style={styles.topSection}>
                    <View style={styles.profileWrapper}>
                        <Image source={profileImage ? { uri: profileImage } : require('@/assets/images/modie-sample.png')} style={styles.profile} />
                        {/* 찜 버튼 */}
                        <Pressable style={styles.heartButton} onPress={handleLikePress}>
                            {liked ? (
                                <IcHeartFilled width={iconHeartSize} height={iconHeartSize} />
                            ) : (
                                <IcHeartOutline width={iconHeartSize} height={iconHeartSize} stroke={Theme.colors.lightGray} />
                            )}
                        </Pressable>
                    </View>

                    <View style={styles.topInfo}>
                        <Text style={styles.name}>{artist.name}</Text>
                        {/* 예매 알림 버튼 */}
                        <Pressable style={styles.notifyButton} onPress={handleNotifyPress}>
                            <Text style={styles.notifyText}>공연알림</Text>
                            {isNotified ? (
                                <IcBellOn width={iconBellSize} height={iconBellSize} fill={Theme.colors.gray} />
                            ) : (
                                <IcBellOff width={iconBellSize} height={iconBellSize} fill={Theme.colors.gray} />
                            )}
                        </Pressable>
                    </View>
                </View>

                <View style={styles.separator} />

                {/* 링크 */}
                <View style={styles.bottomSection}>
                    {artist.spotify_url && (
                        <View style={styles.row}>
                            <Text style={styles.label}>스포티파이</Text>
                            <Pressable onPress={() => Linking.openURL(artist.spotify_url)}>
                                <Text style={styles.link}>바로가기</Text>
                            </Pressable>
                        </View>
                    )}

                    {artist.instagram_account && (
                        <View style={styles.row}>
                            <Text style={styles.label}>인스타그램</Text>
                            <Pressable
                                onPress={() =>
                                    Linking.openURL(
                                        `https://www.instagram.com/${artist.instagram_account}`
                                    )
                                }
                            >
                                <Text style={styles.link}>@{artist.instagram_account}</Text>
                            </Pressable>
                        </View>
                    )}

                    {/* 예정 공연 */}
                    <View style={styles.rowColumn}>
                        <Text style={styles.label}>예정 공연</Text>
                        {artist.upcomingPerformances?.length ? (
                            <FlatList
                                data={artist.upcomingPerformances}
                                renderItem={({ item }) => (
                                    <PerformanceCard
                                        type="history"
                                        title={item.title}
                                        date={getDateFromDateString(item.date)}
                                        posterUrl={item.image_url}
                                        onPress={() => router.push(`/performance/${item.id}`)}
                                    />
                                )}
                                keyExtractor={(item) => item.id.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.list}
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
                        {artist.pastPerformances?.length ? (
                            <FlatList
                                data={artist.pastPerformances}
                                renderItem={({ item }) => (
                                    <PerformanceCard
                                        type="history"
                                        title={item.title}
                                        date={getDateFromDateString(item.date)}
                                        posterUrl={item.image_url}
                                        onPress={() => router.push(`/performance/${item.id}`)}
                                    />
                                )}
                                keyExtractor={(item) => item.id.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.list}
                            />
                        ) : (
                            <Text style={styles.noPerformanceText}>
                                지난 공연이 없습니다.
                            </Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.white },

    topSection: { flexDirection: "row", padding: Theme.spacing.md },
    profileWrapper: { alignItems: "center", marginRight: Theme.spacing.md },
    profile: { width: 90, height: 90, borderRadius: 45, borderWidth: 1, borderColor: Theme.colors.lightGray },
    heartButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: Theme.iconSizes.lg,
        height: Theme.iconSizes.lg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Theme.colors.lightGray,
        backgroundColor: Theme.colors.white,
        alignItems: "center",
        justifyContent: "center",
    },
    topInfo: { flex: 1, justifyContent: "center" },
    name: { fontSize: Theme.fontSizes.lg, fontWeight: Theme.fontWeights.bold, marginBottom: Theme.spacing.sm },
    notifyButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: Theme.spacing.sm,
        paddingVertical: Theme.spacing.xs,
        borderWidth: 1,
        borderRadius: 20,
        borderColor: Theme.colors.lightGray,
        alignSelf: "flex-start",
    },
    notifyText: { color: Theme.colors.gray, marginRight: Theme.spacing.xs },
    separator: { borderBottomWidth: 1, borderBottomColor: Theme.colors.lightGray },

    bottomSection: { padding: Theme.spacing.md },
    row: { flexDirection: "row", alignItems: "center" },
    rowColumn: { marginBottom: Theme.spacing.md },
    label: { width: "25%", fontSize: Theme.fontSizes.base, fontWeight: Theme.fontWeights.semibold, paddingVertical: Theme.spacing.md },
    link: { fontSize: Theme.fontSizes.base, textDecorationLine: "underline" },
    list: { paddingRight: Theme.spacing.md },
    noPerformanceText: { fontSize: Theme.fontSizes.base, color: Theme.colors.gray, },
});
