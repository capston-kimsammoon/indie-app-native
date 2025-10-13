// components/cards/MagazineCard.tsx
import { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import Theme from "@/constants/Theme";
import { MagazineItem } from "@/types/magazine";

type MagazineCardProps = {
    item: MagazineItem;
    onPress?: () => void;
};

export default function MagazineCard({ item, onPress }: MagazineCardProps) {
    const mainImage = item.images?.[0]?.imageUrl || item.coverImageUrl;
    const [imgWidth, setImgWidth] = useState(0);

    useEffect(() => {
        Image.getSize(mainImage, (width, height) => {
            setImgWidth((120 * width) / height); // 고정 높이에 맞춘 폭 계산
        });
    }, [mainImage]);

    return (
        <TouchableOpacity onPress={onPress} style={styles.card}>
            <Image
                source={{ uri: mainImage }}
                style={[styles.poster, { width: imgWidth }]}
                resizeMode="cover"
            />
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>
                    {item.title}
                </Text>
                {item.content ? (
                    <Text style={styles.content} numberOfLines={2}>
                        {item.content}
                    </Text>
                ) : null}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
    },
    poster: {
        height: 100,          // 카드 높이 고정
        aspectRatio: undefined, // 필요하면 원본 비율 유지
        width: undefined,      
        maxWidth: 180,
        borderRadius: 8,
        marginRight: Theme.spacing.md,
    },

    info: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        paddingVertical: Theme.spacing.xs,
    },
    title: {
        fontSize: Theme.fontSizes.base,
        fontWeight: Theme.fontWeights.semibold,
        color: Theme.colors.black,
    },
    content: {
        fontSize: Theme.fontSizes.sm,
        fontWeight: Theme.fontWeights.regular,
        color: Theme.colors.darkGray,
    },
});
