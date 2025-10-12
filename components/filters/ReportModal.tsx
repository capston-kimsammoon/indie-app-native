import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Modal } from "react-native";
import Theme from "@/constants/Theme";

export const REPORT_TYPES = [
    { label: "부적절한 내용", value: "inappropriate" },
    { label: "스팸", value: "spam" },
    { label: "욕설/비방", value: "abuse" },
    { label: "개인정보 노출", value: "personal_info" },
    { label: "기타", value: "other" },
] as const;

export type ReportType = typeof REPORT_TYPES[number]["value"];

interface Props {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (type: ReportType) => void;
}

export default function ReportModal({ visible, onCancel, onSubmit }: Props) {
    const [selectedType, setSelectedType] = useState<ReportType | null>(null);

    const handleSubmit = () => {
        if (selectedType) {
            onSubmit(selectedType);
            setSelectedType(null);
        }
    };

    const handleCancel = () => {
        setSelectedType(null);
        onCancel();
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>신고 유형 선택</Text>
                    {REPORT_TYPES.map((r) => (
                        <Pressable
                            key={r.value}
                            style={[
                                styles.option,
                                selectedType === r.value && styles.selectedOption,
                            ]}
                            onPress={() => setSelectedType(r.value)}
                        >
                            <Text style={styles.optionText}>{r.label}</Text>
                        </Pressable>
                    ))}
                    <View style={styles.buttons}>
                        <Pressable onPress={handleCancel} style={styles.button}>
                            <Text style={styles.buttonText}>취소</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleSubmit}
                            style={[styles.button, !selectedType && styles.disabledButton]}
                            disabled={!selectedType}
                        >
                            <Text style={styles.buttonText}>제출</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: Theme.colors.shadow,
        justifyContent: "center",
        alignItems: "center",
    },
    modal: {
        width: "80%",
        backgroundColor: Theme.colors.white,
        borderRadius: 12,
        padding: Theme.spacing.md,
    },
    title: {
        fontSize: Theme.fontSizes.base,
        fontWeight: Theme.fontWeights.bold,
        marginBottom: Theme.spacing.sm,
    },
    option: {
        padding: Theme.spacing.sm,
        borderRadius: 8,
        marginBottom: Theme.spacing.xs,
        borderWidth: 1,
        borderColor: Theme.colors.lightGray,
    },
    selectedOption: {
        backgroundColor: Theme.colors.themeOrange + "50",
        borderColor: Theme.colors.themeOrange,
    },
    optionText: {
        color: Theme.colors.black,
        fontSize: Theme.fontSizes.sm,
        fontWeight: Theme.fontWeights.regular,
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: Theme.spacing.md,
    },
    button: {
        marginLeft: Theme.spacing.sm,
    },
    disabledButton: {
        opacity: 0.5,
    },
    buttonText: {
        fontSize: Theme.fontSizes.base,
        color: Theme.colors.themeOrange,
        fontWeight: Theme.fontWeights.semibold,
    },
});
