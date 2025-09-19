// /venue/[id]/reviews.tsx
import React from "react";
import { View, Text, StyleSheet, Image, FlatList, Pressable, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import Theme from "@/constants/Theme";
import { getDateFromDateString } from "@/utils/dateUtils";

type RouteParams = { id: string };

const MOCK_REVIEWS = [
    {
        id: "1",
        userProfile: "https://picsum.photos/100/100",
        userName: "하츄핑",
        date: "2025-09-28",
        content: "여기 음료 따로 팔아서 음료 반입  안돼여 근데 여기 음료 싸고 맛있어서 ㄱㅊ 레몬에이드가 젤 맛있음 여기 음료 따로 팔아서 음료 반입  안돼여 근데 여기 음료 싸고 맛있어서 ㄱㅊ 레몬에이드가 젤 맛있음 여기 음료 따로 팔아서 음료 반입  안돼여 근데 여기 음료 싸고 맛있어서 ㄱㅊ 레몬에이드가 젤 맛있음 여기 음료 따로 팔아서 음료 반입  안돼여 근데 여기 음료 싸고 맛있어서 ㄱㅊ 레몬에이드가 젤 맛있음 여기 음료 따로 팔아서 음료 반입  안돼여 근데 여기 음료 싸고 맛있어서 ㄱㅊ 레몬에이드가 젤 맛있음 여기 음료 따로 팔아서 음료 반입  안돼여 근데 여기 음료 싸고 맛있어서 ㄱㅊ 레몬에이드가 젤 맛있음"
    },
    {
        id: "2",
        userProfile: "https://picsum.photos/100/100",
        userName: "파랑핑",
        date: "2025.09.28",
        content: "홍입에서 걸어서 10분도 안 걸림 홍입에서 걸어서 10분도 안 걸림 홍입에서 걸어서 10분도 안 걸림 홍입에서 걸어서 10분도 안 걸림"
    },
    {
        id: "3",
        userProfile: "https://picsum.photos/100/100",
        date: "2025.09.28",
        userName: "파랑핑",
        content: "ㄱㅊㄱㅊ"
    }
];

export default function VenueReviewsPage() {
    const route = useRoute();
    const { id } = route.params as RouteParams;

    return (
        <View style={styles.container}>
            <FlatList
                data={MOCK_REVIEWS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.reviewCard}>
                        <Text style={styles.content}>{item.content.slice(0, 300)}</Text>
                        <View style={styles.footer}>
                            <Image source={{uri: item.userProfile}} style={styles.profile} />
                            <Text style={styles.userName}>{item.userName}</Text>
                            <Text style={styles.date}>{getDateFromDateString(item.date)}</Text>
                            <Pressable
                                style={styles.reportButton}
                                onPress={() =>
                                    Alert.alert(
                                        "신고", // 제목
                                        "이 리뷰를 신고하시겠습니까?", // 메시지
                                        [
                                            { text: "취소", style: "cancel" },
                                            { text: "신고", style: "destructive", onPress: () => console.log("신고 완료") },
                                        ],
                                        { cancelable: true }
                                    )
                                }
                            >
                                <Text style={styles.reportText}>신고</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
                contentContainerStyle={{ padding: Theme.spacing.md }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.white,
    },
    reviewCard: {
        marginBottom: Theme.spacing.md,
        padding: Theme.spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Theme.colors.lightGray,
        backgroundColor: Theme.colors.white,
    },
    content: {
        fontSize: Theme.fontSizes.sm,
        fontWeight: Theme.fontWeights.medium,
        color: Theme.colors.darkGray,
        marginBottom: Theme.spacing.sm,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: Theme.spacing.sm,
    },
    profile: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: Theme.spacing.sm,
    },
    userName: {
        fontSize: Theme.fontSizes.sm,
        fontWeight: Theme.fontWeights.regular,
        marginRight: Theme.spacing.sm,
    },
    date: {
        fontSize: Theme.fontSizes.sm,
        fontWeight: Theme.fontWeights.regular,
        color: Theme.colors.gray,
        marginRight: Theme.spacing.sm,
        flex: 1,
    },
    reportButton: {
    },
    reportText: {
        fontSize: Theme.fontSizes.sm,
        fontWeight: Theme.fontWeights.medium,
        color: Theme.colors.gray,
        textDecorationLine: "underline",
    },
});
