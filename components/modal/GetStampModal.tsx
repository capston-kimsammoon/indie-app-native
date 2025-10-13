// components/modal/GetStampModal.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { fetchAvailableStamps, collectStamp } from "@/api/StampApi";
import { formatDateWithShortDay } from "@/utils/dateUtils";
import Theme from "@/constants/Theme";

type Candidate = {
    id: number;
    title: string;
    venue: string;
    date: string;
    posterUrl?: string;
};

type GroupedStamps = {
    date: string;
    items: Candidate[];
};

interface GetStampModalProps {
    visible: boolean;
    onClose: () => void;
}

function isAlreadyCollectedError(err: any) {
    const res = err?.response;
    if (!res) return false;
    const status = Number(res.status);
    const data = res.data || {};
    const code = String(data.code ?? data.errorCode ?? data.error_code ?? "").toUpperCase();
    const msg = String(data.message ?? data.detail ?? data.error ?? "").toLowerCase();
    return (
        status === 400 &&
        (
            code.includes("ALREADY") ||
            msg.includes("already") ||
            msg.includes("exists") ||
            msg.includes("중복") ||
            msg.includes("이미")
        )
    );
}

export default function GetStampModal({ visible, onClose }: GetStampModalProps) {
    const router = useRouter();
    const [items, setItems] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<Candidate | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const loadAvailable = async () => {
        try {
            setLoading(true);
            const data = await fetchAvailableStamps(3);
            const mapped: Candidate[] = (data || []).map((x: any) => ({
                id: x.performance_id ?? x.id,
                title: x.title,
                venue: x.venue,
                date: formatDateWithShortDay(x.date),
                posterUrl: x.posterUrl ?? x.venueImageUrl ?? undefined,
            }));
            setItems(mapped);
        } catch (e: any) {
            console.error(e);
            Alert.alert("오류", e?.message ?? "스탬프 후보를 불러오지 못했어요.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible) {
            loadAvailable();
        }
    }, [visible]);

    const groupedStamps: GroupedStamps[] = useMemo(() => {
        const groups = new Map<string, Candidate[]>();
        items.forEach((item) => {
            if (!groups.has(item.date)) {
                groups.set(item.date, []);
            }
            groups.get(item.date)!.push(item);
        });
        return Array.from(groups.entries())
            .map(([date, items]) => ({
                date,
                items,
            }))
            .sort((a, b) => b.date.localeCompare(a.date));
    }, [items]);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
            statusBarTranslucent
            presentationStyle="overFullScreen"
        >
            <View style={styles.modalBackdrop}>
                <View style={styles.modalContainer}>
                    {/* 헤더 */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>스탬프 받기</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={8}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 본문 */}
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Theme.colors.themeOrange} />
                            <Text style={styles.loadingText}>불러오는 중...</Text>
                        </View>
                    ) : (
                        <ScrollView style={styles.scrollView}>
                            {groupedStamps.length === 0 ? (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>받을 수 있는 스탬프가 없습니다</Text>
                                </View>
                            ) : (
                                groupedStamps.map((group) => (
                                    <View key={group.date} style={styles.dateGroup}>
                                        <View style={styles.dateHeader}>
                                            <Text style={styles.dateText}>{group.date}</Text>
                                        </View>
                                        <View style={styles.cardsContainer}>
                                            {group.items.map((item) => (
                                                <TouchableOpacity
                                                    key={item.id}
                                                    style={styles.card}
                                                    onPress={() => {
                                                        setSelected(item);
                                                        setShowConfirm(true);
                                                    }}
                                                    activeOpacity={0.7}
                                                >
                                                    <Image
                                                        source={
                                                            item.posterUrl
                                                                ? { uri: item.posterUrl }
                                                                : require("@/assets/images/modie-sample.png")
                                                        }
                                                        style={styles.posterImage}
                                                    />
                                                    <Text style={styles.venueText} numberOfLines={1}>
                                                        {item.venue}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    )}
                </View>
            </View>

            {/* 확인 모달: <Modal>이 아닌 <View>로 구현하여 메인 모달 위에 띄움 */}
            {showConfirm && (
                <View style={styles.confirmOverlay}>
                    <Pressable
                        style={styles.confirmBackdrop}
                        onPress={() => setShowConfirm(false)}
                    />
                    <View style={styles.confirmBox}>
                        <Text style={styles.confirmText}>스탬프를 받으시겠습니까?</Text>
                        <View style={styles.confirmButtons}>
                            <Pressable
                                style={[styles.confirmBtn, styles.confirmOk]}
                                onPress={async () => {
                                    try {
                                        if (selected) {
                                            await collectStamp(selected.id);
                                            setShowConfirm(false);
                                            Alert.alert(
                                                "스탬프 수집 완료",
                                                `${selected.title} 공연의 스탬프를 받았어요!`,
                                                [
                                                    {
                                                        text: "스탬프 리스트 이동",
                                                        onPress: () => {
                                                            onClose();
                                                            router.push("/stamp");
                                                        },
                                                    },
                                                    { text: "닫기", style: "cancel" },
                                                ]
                                            );
                                            await loadAvailable();
                                        }
                                    } catch (e: any) {
                                        console.error(e);
                                        setShowConfirm(false);
                                        if (isAlreadyCollectedError(e)) {
                                            Alert.alert(
                                                "이미 받은 스탬프",
                                                `${selected?.title ?? ""} 공연 스탬프는 이미 수집되었습니다.`
                                            );
                                        } else {
                                            Alert.alert("오류", e?.message ?? "스탬프 수집에 실패했어요.");
                                        }
                                    }
                                }}
                            >
                                <Text style={styles.confirmOkText}>예</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.confirmBtn, styles.confirmCancel]}
                                onPress={() => setShowConfirm(false)}
                            >
                                <Text style={styles.confirmCancelText}>취소</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        backgroundColor: Theme.colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: "90%",
        paddingBottom: Theme.spacing.xl,
        elevation: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: Theme.spacing.lg,
        paddingVertical: Theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.lightGray,
    },
    headerTitle: {
        fontSize: Theme.fontSizes.lg,
        fontWeight: Theme.fontWeights.bold,
        color: Theme.colors.black,
    },
    closeButton: {
        fontSize: 24,
        color: Theme.colors.darkGray,
        fontWeight: Theme.fontWeights.light,
    },
    loadingContainer: {
        paddingVertical: Theme.spacing.xl * 2,
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },
    loadingText: {
        marginTop: Theme.spacing.sm,
        color: Theme.colors.darkGray,
        fontSize: Theme.fontSizes.sm,
    },
    scrollView: {
        flex: 1,
    },
    emptyContainer: {
        paddingVertical: Theme.spacing.xl * 2,
        alignItems: "center",
    },
    emptyText: {
        color: Theme.colors.gray,
        fontSize: Theme.fontSizes.base,
    },
    dateGroup: {
        marginBottom: Theme.spacing.xs,
    },
    dateHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: Theme.spacing.lg,
        marginTop: Theme.spacing.md,
    },
    dateText: {
        fontSize: Theme.fontSizes.lg,
        fontWeight: Theme.fontWeights.semibold,
        color: Theme.colors.themeOrange,
    },
    cardsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: Theme.spacing.md,
        paddingTop: Theme.spacing.md,
    },
    card: {
        width: "33.33%",
        paddingHorizontal: Theme.spacing.sm,
        marginBottom: Theme.spacing.md,
        alignItems: "center",
    },
    posterImage: {
        width: "100%",
        aspectRatio: 3 / 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Theme.colors.lightGray,
        marginBottom: Theme.spacing.sm,
    },
    venueText: {
        fontSize: Theme.fontSizes.sm,
        fontWeight: Theme.fontWeights.medium,
        color: Theme.colors.black,
        textAlign: "center",
        width: "100%",
    },
    confirmOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999, // 이 zIndex가 이제 메인 모달 컨텐츠 위에 오도록 보장합니다.
    },
    confirmBackdrop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    confirmBox: {
        backgroundColor: Theme.colors.white,
        borderRadius: 12,
        padding: Theme.spacing.lg,
        width: "80%",
        alignItems: "center",
        elevation: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    confirmText: {
        fontSize: Theme.fontSizes.base,
        marginBottom: Theme.spacing.md,
        color: Theme.colors.black,
    },
    confirmButtons: {
        flexDirection: "row",
        gap: Theme.spacing.sm,
        width: "100%",
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: Theme.spacing.sm,
        borderRadius: 8,
        alignItems: "center",
    },
    confirmOk: {
        backgroundColor: Theme.colors.themeOrange,
    },
    confirmOkText: {
        color: Theme.colors.white,
        fontWeight: Theme.fontWeights.semibold,
    },
    confirmCancel: {
        backgroundColor: Theme.colors.lightGray,
    },
    confirmCancelText: {
        color: Theme.colors.darkGray,
        fontWeight: Theme.fontWeights.semibold,
    },
});