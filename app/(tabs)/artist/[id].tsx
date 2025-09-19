// app/(tabs)/artist/[id].tsx
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
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";

import Theme from "@/constants/Theme";
import PerformanceCard from "@/components/cards/PerformanceCard";

import IcHeartOutline from "@/assets/icons/ic-heart-outline.svg";
import IcHeartFilled from "@/assets/icons/ic-heart-filled.svg";
import IcBellOff from "@/assets/icons/ic-bell-off.svg";
import IcBellOn from "@/assets/icons/ic-bell-on.svg";

type RouteParams = { id: string };

const MOCK_DETAIL = {
    id: "1",
    name: "김삼문과아이들",
    profileUrl: "https://picsum.photos/100/100",
    spotifyUrl: "https://open.spotify.com/",
    instagramAccount: "kimthreemun",
    upcomingPerformances: [
        { id: "1", title: "시간의 목소리", date: "2025.05.10", posterUrl: "https://picsum.photos/90/120" },
        { id: "2", title: "우리의 16번째 절기 ‘추분’", date: "2025.05.10", posterUrl: "https://picsum.photos/100/100" },
        { id: "3", title: "시간의 목소리", date: "2025.05.10", posterUrl: "https://picsum.photos/100/100" },
    ],
    pastPerformances: [
        { id: "1", title: "시간의 목소리~", date: "2025.05.10", posterUrl: "https://picsum.photos/100/100" },
        { id: "2", title: "우리의 16번째 절기 ‘추분’", date: "2025.05.10", posterUrl: "https://picsum.photos/100/100" },
        { id: "3", title: "시간의 목소리", date: "2025.05.10", posterUrl: "https://picsum.photos/100/100" },
    ],
};

export default function ArtistDetailPage() {
    const route = useRoute();
    const router = useRouter();
    const { id } = route.params as RouteParams;

    const artist = MOCK_DETAIL;
    const iconHeartSize = Theme.iconSizes.xs;
    const iconBellSize = Theme.iconSizes.xs;

    // 좋아요 상태 관리
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState();

    // 알림 상태 관리
    const [isNotified, setIsNotified] = useState(false);

    const [likedArtists, setLikedArtists] = useState<{ [key: string]: boolean }>({});


    const handleLikePress = () => {
        if (liked) {
            setLiked(false);
        } else {
            setLiked(true);
        }
    };

    const toggleLike = (id: string) => {
        setLikedArtists((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return (
        <View style={{ flex: 1 }}>

            <ScrollView style={styles.container}>
                {/* 상단 아티스트 정보 */}
                <View style={styles.topSection}>
                    {/* 프로필 + 좋아요 */}
                    <View style={styles.profileWrapper}>
                        <Image source={{uri: artist.profileUrl}} style={styles.profile} />

                        <Pressable style={styles.heartButton} onPress={handleLikePress}>
                            {liked ? (
                                <IcHeartFilled width={iconHeartSize} height={iconHeartSize} />
                            ) : (
                                <IcHeartOutline width={iconHeartSize} height={iconHeartSize} />
                            )}
                        </Pressable>
                    </View>


                    {/* 아티스트 텍스트 정보 */}
                    <View style={styles.topInfo}>
                        <Text style={styles.name}>{artist.name}</Text>
                        <Pressable style={styles.notifyButton}>
                            <Text style={styles.notifyText}>공연알림</Text>
                            {isNotified ? <IcBellOff width={iconBellSize} height={iconBellSize} color={Theme.colors.gray} /> : <IcBellOn width={iconBellSize} height={iconBellSize} color={Theme.colors.gray} />}
                        </Pressable>
                    </View>
                </View>

                <View style={styles.separator} />

                <View style={styles.bottomSection}>

                    <View style={styles.row}>
                        <Text style={styles.label}>스포티파이</Text>
                        <Pressable onPress={() => Linking.openURL(artist.spotifyUrl)}>
                            <Text style={styles.link}>바로가기</Text>
                        </Pressable>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>인스타그램</Text>
                        <Pressable onPress={() => Linking.openURL(`https://www.instagram.com/${artist.instagramAccount}`)}>
                            <Text style={styles.link}>@{artist.instagramAccount}</Text>
                        </Pressable>
                    </View>

                    <View style={styles.rowColumn}>
                        <Text style={styles.label}>예정 공연</Text>
                        <FlatList
                            data={artist.upcomingPerformances}
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
                            data={artist.upcomingPerformances}
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
        padding: Theme.spacing.md,
    },
    profileWrapper: {
        alignItems: "center",
        marginRight: Theme.spacing.md
    },
    profile: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    heartButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: Theme.iconSizes.md,
        height: Theme.iconSizes.md,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Theme.colors.lightGray,
        backgroundColor: Theme.colors.white,
        alignItems: "center",
        justifyContent: "center",
    },

    topInfo: {
        flex: 1,
        justifyContent: "center"
    },
    name: {
        fontSize: Theme.fontSizes.lg,
        fontWeight: Theme.fontWeights.bold,
        marginBottom: Theme.spacing.sm,
    },
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
    notifyText: {
        color: Theme.colors.gray,
        marginRight: Theme.spacing.xs,
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.lightGray,
    },

    bottomSection: {
        padding: Theme.spacing.md,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    rowColumn: {
    },
    label: {
        width: "25%",
        fontSize: Theme.fontSizes.base,
        fontWeight: Theme.fontWeights.semibold,
        paddingVertical: Theme.spacing.md,
    },
    valueWithIcon: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    value: {
        fontSize: Theme.fontSizes.base,
        color: Theme.colors.black,
        marginRight: Theme.spacing.xs,
    },

    // 링크
    link: { fontSize: Theme.fontSizes.base, textDecorationLine: "underline" },

    list: {
        paddingRight: Theme.spacing.md,
    },
});
