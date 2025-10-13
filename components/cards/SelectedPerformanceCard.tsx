import React from 'react';
import { useRouter } from 'expo-router';
import { useRoute } from "@react-navigation/native";

import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { SelectedNearbyPerformanceItem } from '@/types/nearby';
import IcChevronRight from '@/assets/icons/ic-chevron-right.svg';
import Theme from "@/constants/Theme";
import IcClipboard from "@/assets/icons/ic-clipboard.svg";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";

type SelectedPerformanceCardProps = {
    venueId: string;
    title: string;
    address?: string;
    time?: string;
    name?: string;
    posterUrl?: string;
};

export default function SelectedPerformanceCard({
    venueId,
    title,
    address,
    time,
    name,
    posterUrl,
}: SelectedPerformanceCardProps) {
    const router = useRouter();
    
    return (
        <View style={styles.card}>
            <Image
                source={posterUrl ? { uri: posterUrl } : require("@/assets/images/modie-sample.png")}
                style={styles.poster}
                resizeMode="cover"
            />
            <View style={styles.info}>
                <View style={styles.topInfo}>
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                    {time && <Text style={styles.time} numberOfLines={1}>{time}</Text>}
                </View>
                <View style={styles.bottomInfo}>
                    <View style={styles.valueWithIcon}>
                        {name && <Text style={styles.name} numberOfLines={1}>{name}</Text>}
                        <Pressable style={styles.chevronIcon} onPress={() => router.push(`/venue/${venueId}`)}>
                            <IcChevronRight width={Theme.iconSizes.sm} height={Theme.iconSizes.sm} fill={Theme.colors.darkGray} />
                        </Pressable>
                    </View>
                    {address &&
                        <View style={styles.valueWithIcon}>
                            <Text style={styles.address} numberOfLines={1}>{address}</Text>
                            <Pressable
                                onPress={async () => {
                                    await Clipboard.setStringAsync(address);
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
                                <IcClipboard width={Theme.iconSizes.xs} height={Theme.iconSizes.xs} />
                            </Pressable>
                        </View>}
                </View>
            </View>
        </View >
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        width: "100%",
        alignContent: "center",
        alignItems: "center",
        backgroundColor: Theme.colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Theme.colors.themeOrange,
        marginBottom: Theme.spacing.xs,
        padding: Theme.spacing.md,
        shadowColor: Theme.colors.black,
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    poster: {
        width: 90,
        height: 120,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Theme.colors.lightGray,
        marginRight: Theme.spacing.md,
    },
    topInfo: {
        flexDirection: "column",
        paddingVertical: Theme.spacing.sm,
    },
    info: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    title: {
        fontSize: Theme.fontSizes.base,
        fontWeight: Theme.fontWeights.semibold,
        marginBottom: Theme.spacing.sm,
        color: Theme.colors.black,
    },
    time: {
        fontSize: Theme.fontSizes.sm,
        color: Theme.colors.black,
    },
    bottomInfo: {
        flexDirection: "column",
        paddingVertical: Theme.spacing.sm,
    },
    name: {
        flexShrink: 1,
        fontSize: Theme.fontSizes.base,
        fontWeight: Theme.fontWeights.semibold,
        color: Theme.colors.black,
    },
    chevronIcon: {
        marginLeft: Theme.spacing.xs,
    },
    valueWithIcon: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: Theme.spacing.sm,
    },
    address: {
        flexShrink: 1,
        fontSize: Theme.fontSizes.sm,
        fontWeight: Theme.fontWeights.regular,
        color: Theme.colors.darkGray,
    },
    clipboardIcon: {
        marginLeft: Theme.spacing.xs,
    }
});
