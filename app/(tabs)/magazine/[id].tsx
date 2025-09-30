// app/(tabs)/magazine/[id].tsx
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    View,
    Text,
    Image,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import Theme from "@/constants/Theme";
import { useLocalSearchParams } from "expo-router";
import { fetchMagazineDetail } from "@/api/MagazineApi";
import { MagazineItem, MagazineContentBlock } from "@/types/magazine";
import { formatISODateTime } from "@/utils/dateUtils";

export default function MagazineDetailPage() {
    const params = useLocalSearchParams<{ id: string }>();
    const id = params.id;
    const [magazine, setMagazine] = useState<MagazineItem | null>(null);
    const [loading, setLoading] = useState(true);

    const screenWidth = Dimensions.get("window").width;
    const maxImageWidth = screenWidth - Theme.spacing.md * 2; // 좌우 패딩 제외

    useEffect(() => {
        if (!id) return;
        fetchMagazineDetail(id)
            .then((data) => setMagazine(data))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

    if (!magazine) return <Text>매거진을 불러올 수 없습니다.</Text>;

    const renderParagraphs = (text: string, keyPrefix: string) =>
        text.split(/\n{2,}/).map((para, i) =>
            para.trim() ? (
                <Text key={`${keyPrefix}-${i}`} style={styles.contentText}>
                    {para.trim()}
                </Text>
            ) : (
                <View key={`${keyPrefix}-${i}`} style={{ height: 8 }} />
            )
        );

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: Theme.spacing.md }}>
            {/* 제목 + 날짜 */}
            <View style={styles.header}>
                <Text style={styles.title}>{magazine.title}</Text>
                <Text style={styles.date}>{formatISODateTime(magazine.date)}</Text>
            </View>

            {/* 구분선 */}
            <View style={styles.separator} />

            {/* 콘텐츠 블록 */}
            {magazine.contents.map((block: MagazineContentBlock, index: number) => {
                if (block.type === "text") {
                    return (
                        <View key={index} style={{ marginBottom: Theme.spacing.md }}>
                            {renderParagraphs(block.value, `text-${index}`)}
                        </View>
                    );
                }

                if (block.type === "image") {
                    // align 가져오기, 없으면 center
                    const align: "left" | "center" | "right" = (block as any).align ?? "center";
                    return (
                        <View
                            key={index}
                            style={{
                                width: "100%",
                                alignItems:
                                    align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center",
                                marginBottom: Theme.spacing.md,
                            }}
                        >
                            <Image
                                source={{ uri: block.value }}
                                style={{
                                    width: maxImageWidth,
                                    aspectRatio: 1.5, // 필요 시 서버에서 실제 비율 가져오기
                                    borderRadius: 8,
                                }}
                                resizeMode="contain"
                            />
                        </View>

                    );
                }

                return null;
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.white,
    },
    header: {
        marginBottom: Theme.spacing.md,
    },
    title: {
        fontSize: Theme.fontSizes.lg,
        fontWeight: Theme.fontWeights.semibold,
        color: Theme.colors.black,
        textAlign: "center",
        marginBottom: Theme.spacing.xs,
    },
    date: {
        fontSize: Theme.fontSizes.xs,
        color: Theme.colors.gray,
        textAlign: "right",
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.lightGray,
        marginBottom: Theme.spacing.md,
    },
    contentText: {
        fontSize: Theme.fontSizes.sm,
        color: Theme.colors.black,
        lineHeight: 22,
    },
});
