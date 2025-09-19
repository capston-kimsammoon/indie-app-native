// app/(tabs)/performance/[id].tsx
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

import Header from "@/components/layout/Header";
import Theme from "@/constants/Theme";
import { formatDateTime, calcDDay } from "@/utils/dateUtils";

import IcHeartOutline from "@/assets/icons/ic-heart-outline.svg";
import IcHeartFilled from "@/assets/icons/ic-heart-filled.svg";
import IcBellOff from "@/assets/icons/ic-bell-off.svg";
import IcBellOn from "@/assets/icons/ic-bell-on.svg";
import IcChevronRight from "@/assets/icons/ic-chevron-right.svg";

type RouteParams = { id: string };

const MOCK_DETAIL = {
    id: "1",
    title: "Ruby Rock SALON",
    posterUrl: "https://picsum.photos/90/120",
    date: new Date("2025-05-09"),
    time: "20:00:00",
    venue: { id: "1", name: "cafe PPnF", },
    lineup: [
        { id: "a", name: "푸롱이핑", profileUrl: "https://picsum.photos/100/100" },
        { id: "b", name: "로얄 티니핑", profileUrl: "https://picsum.photos/100/100" },
        { id: "c", name: "애플 이쁜핑", profileUrl: "https://picsum.photos/100/100" },
    ],
    price: "1,000원",
    ticketOpen: new Date("2025-05-01"),
    ticketOpenTime: "T21:00:00",
    ticketLink: "https://www.melon.ticket",
    detailLink: "https://www.instagram.com/kimthreemunnnnnnnnnnn", // 수정) 2열 이상일 때 1열을 label 위치와 맞추기
    likes: 1004,
};

export default function PerformanceDetailPage() {
    const route = useRoute();
    const router = useRouter();
    const { id } = route.params as RouteParams;

    const performance = MOCK_DETAIL; // 실제 DB 연동 시 id 기반 조회
    const iconSize = Theme.iconSizes.xs;

    // 좋아요 상태 관리
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(performance.likes);

    // 알림 상태 관리
    const [isNotified, setIsNotified] = useState(false);

    const handleLikePress = () => {
        if (liked) {
            setLiked(false);
            setLikeCount(likeCount - 1);
        } else {
            setLiked(true);
            setLikeCount(likeCount + 1);
        }
    };

    return (
        <View style={{ flex: 1 }}>

            <ScrollView style={styles.container}>
                {/* 상단 공연 정보 */}
                <View style={styles.topSection}>
                    {/* 포스터 + 좋아요 */}
                    <View style={styles.posterWrapper}>
                        <Image
                            source={{ uri: performance.posterUrl }}
                            style={styles.poster}
                        />
                        <Pressable style={styles.likesBox} onPress={handleLikePress}>
                            {liked ? <IcHeartFilled width={iconSize} height={iconSize} /> : <IcHeartOutline width={iconSize} height={iconSize} />}
                            <Text style={styles.likeCount}>{likeCount.toLocaleString()}</Text>
                        </Pressable>
                    </View>

                    {/* 공연 텍스트 정보 */}
                    <View style={styles.topInfo}>
                        <Text style={styles.dday}>{calcDDay(performance.date)}</Text>
                        <Text style={styles.title}>{performance.title}</Text>
                        <Pressable style={styles.notifyButton}>
                            <Text style={styles.notifyText}>예매알림</Text>
                            {isNotified ? <IcBellOff width={iconSize} height={iconSize} color={Theme.colors.gray} /> : <IcBellOn width={iconSize} height={iconSize} color={Theme.colors.gray} />}
                        </Pressable>
                    </View>
                </View>

                <View style={styles.separator} />

                {/* 공연일시 */}
                <View style={styles.row}>
                    <Text style={styles.label}>공연일시</Text>
                    <Text style={styles.value}>{formatDateTime(performance.date, performance.time)}</Text>
                </View>

                {/* 공연장 */}
                <View style={styles.row}>
                    <Text style={styles.label}>공연장</Text>
                    <View style={styles.valueWithIcon}>
                        <Text style={styles.value}>{performance.venue.name}</Text>
                        <Pressable onPress={() => router.push(`/venue/${performance.venue.id}}`)}>
                            <IcChevronRight width={iconSize} height={iconSize} />
                        </Pressable>
                    </View>
                </View>

                {/* 출연진 */}
                <View style={styles.rowColumn}>
                    <Text style={styles.label}>출연진</Text>
                    <FlatList
                        data={performance.lineup}
                        horizontal
                        keyExtractor={(item) => item.id}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <Pressable
                                style={styles.artist}
                                onPress={() =>
                                    router.push(`/artist/${item.id}`)
                                }
                            >
                                <Image source={{uri: item.profileUrl}} style={styles.profile} />
                                <Text style={styles.artistName}>{item.name}</Text>
                            </Pressable>
                        )}
                    />
                </View>

                {/* 티켓가격 */}
                <View style={styles.row}>
                    <Text style={styles.label}>티켓가격</Text>
                    <Text style={styles.value}>{performance.price}</Text>
                </View>

                {/* 티켓오픈 */}
                <View style={styles.row}>
                    <Text style={styles.label}>티켓오픈</Text>
                    <Text style={styles.value}>{formatDateTime(performance.ticketOpen)}</Text>
                </View>

                {/* 예매링크 */}
                <View style={styles.row}>
                    <Text style={styles.label}>예매링크</Text>
                    <Pressable onPress={() => Linking.openURL(performance.ticketLink)}>
                        <Text style={styles.link}>{performance.ticketLink}</Text>
                    </Pressable>
                </View>

                {/* 상세정보 */}
                <View style={styles.row}>
                    <Text style={styles.label}>상세정보</Text>
                    <Pressable onPress={() => Linking.openURL(performance.detailLink)}>
                        <Text style={styles.link}>{performance.detailLink}</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.white },

    // 상단 섹션
    topSection: { 
        flexDirection: "row", 
        padding: Theme.spacing.md,
    },
    posterWrapper: { alignItems: "center", marginRight: Theme.spacing.md },
    poster: {
        width: 90,
        height: 120,
        borderRadius: 8,
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
    likeCount: {
        fontSize: Theme.fontSizes.sm,
        color: Theme.colors.gray,
        marginLeft: Theme.spacing.xs,
    },

    topInfo: { 
        flex: 1, 
    },
    dday: { 
        fontSize: Theme.fontSizes.sm,
        fontWeight:Theme.fontWeights.medium, 
        color: Theme.colors.gray,
        marginVertical: Theme.spacing.xs,
    },
    title: { 
        fontSize: Theme.fontSizes.lg, 
        fontWeight: Theme.fontWeights.semibold,
        color: Theme.colors.black, 
        marginVertical: Theme.spacing.xs,
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
        marginTop: Theme.spacing.sm,
    },
    notifyText: {
        color: Theme.colors.gray,
        marginRight: Theme.spacing.xs,
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.lightGray,
        marginBottom: Theme.spacing.md,
    },

    // 상세 정보
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
        fontSize: Theme.fontSizes.base,
        color: Theme.colors.black,
        marginRight: Theme.spacing.xs,
    },
    // 출연진
    artist: { 
        alignItems: "center", 
        marginRight: Theme.spacing.md,
        marginVertical: Theme.spacing.md, 
    },
    profile: { 
        width: 60, 
        height: 60, 
        borderRadius: 30, 
        margin: Theme.spacing.sm,
    },
    artistName: { 
        fontSize: Theme.fontSizes.base, 
        color: Theme.colors.darkGray,
        textAlign: "center" 
    },

    // 링크
    link: { fontSize: Theme.fontSizes.base, textDecorationLine: "underline" },
});
