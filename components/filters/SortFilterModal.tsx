import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // ✅ 추가
import Theme from "@/constants/Theme";

type SortType = string;

const SORT_OPTIONS: SortType[] = ["최근등록순", "공연임박순", "인기많은순"];

export default function SortFilterModal({
  visible,
  onClose,
  onChange,
  selectedSort,
}: {
  visible: boolean;
  onClose: () => void;
  onChange: (sort: SortType) => void;
  selectedSort: SortType;
}) {
  const insets = useSafeAreaInsets(); // ✅ 안전영역

  const handleSortSelect = (option: SortType) => {
    onChange(option);
    onClose();
  };

  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      {/* 배경 눌렀을 때 닫힘 */}
      <Pressable style={styles.overlay} onPress={onClose}>
        <View />
      </Pressable>

      {/* 하단 시트 */}
      <View style={[styles.modal, { paddingBottom: insets.bottom }]}>
        <Text style={styles.title}>정렬 선택</Text>
        <View style={styles.row}>
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.option,
                selectedSort === option && styles.selectedOption,
              ]}
              onPress={() => handleSortSelect(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedSort === option && styles.selectedText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: Theme.colors.shadow,
  },
  modal: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: Theme.colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.fontSizes.lg,
    fontWeight: Theme.fontWeights.semibold,
    marginBottom: Theme.spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  option: {
    flex: 1,
    marginHorizontal: Theme.spacing.xs,
    paddingVertical: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedOption: {
    backgroundColor: Theme.colors.themeOrange + "33",
    borderColor: Theme.colors.themeOrange,
  },
  optionText: {
    color: Theme.colors.darkGray,
  },
  selectedText: {
    color: Theme.colors.themeOrange,
    fontWeight: Theme.fontWeights.semibold,
  },
});
