import React from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import Theme from "@/constants/Theme";

import IcChevronRight from "@/assets/icons/ic-chevron-right.svg";

type ReviewPrevCardProps = {
    userProfile: any;
    userName: string;
    content: string;
    isMoreCard?: boolean;
    onPress?: () => void;
};

export default function ReviewPrevCard({ userProfile, userName, content, isMoreCard = false, onPress }: ReviewPrevCardProps) {
    if (isMoreCard) {
        return (
            <Pressable style={styles.moreCard} onPress={onPress}>
                <Text style={styles.moreText}>리뷰</Text>
                <View style={styles.moreTextWithIcon}>
                    <Text style={styles.moreText}>더보기</Text>
                    <IcChevronRight fill={Theme.colors.gray} />
                </View>
            </Pressable>
        );
    }

    return (
        <View style={styles.card}>
            <View style={styles.profileInfo}>
                <Image source={userProfile ? {uri: userProfile} : require('@/assets/images/modie-sample.png')} style={styles.profile} />
                <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
            </View>
            <Text style={styles.content} numberOfLines={1}>{content}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 200,
        justifyContent: "center",
        padding: Theme.spacing.md,
        marginRight: Theme.spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Theme.colors.lightGray,
    },
    profileInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: Theme.spacing.sm,
    },
    profile: {
        width: 25,
        height: 25,
        borderRadius: 15,
        marginRight: Theme.spacing.sm,
        borderWidth: 1,
        borderColor: Theme.colors.lightGray,
    },
    userName: {
        flexShrink: 1,
        fontSize: Theme.fontSizes.base,
        fontWeight: Theme.fontWeights.semibold,
        color: Theme.colors.black,
    },
    content: {
        fontSize: Theme.fontSizes.sm,
        fontWeight: Theme.fontWeights.medium,
        color: Theme.colors.darkGray,
    },
    moreCard: {
        width: 80,
        justifyContent: "center",
        alignItems: "flex-start",
        padding: Theme.spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Theme.colors.lightGray,
        backgroundColor: Theme.colors.white,
    },
    moreText: {
        fontSize: Theme.fontSizes.sm,
        fontWeight: Theme.fontWeights.regular,
        color: Theme.colors.black,
        marginRight: Theme.spacing.xs,
        marginVertical: Theme.spacing.xs,
    },
    moreTextWithIcon: {
        flexDirection: "row",
        alignItems: "center",
    },
});
