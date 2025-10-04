import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { REGION_OPTIONS, RegionType } from "@/constants/regions";
import Theme from "@/constants/Theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (selected: RegionType[], label: string) => void;
  defaultValue?: RegionType[];
};

export default function RegionFilterModal({
  visible,
  onClose,
  onChange,               
  selectedRegions = ["전체"],
}: {
  visible: boolean;
  onClose: () => void;
  onChange: (regions: RegionType[]) => void;
  selectedRegions: RegionType[];
}) {
  const handleRegionSelect = (option: RegionType) => {
    let newRegions: RegionType[];

    if (option === "전체") {
      newRegions = ["전체"];
    } else {
      if (selectedRegions.includes(option)) {
        newRegions = selectedRegions.filter((r) => r !== option);
      } else {
        newRegions = selectedRegions.filter((r) => r !== "전체").concat(option);
      }
      if (newRegions.length === 0) newRegions = ["전체"];
    }

    onChange(newRegions); 
  };

  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View />
      </Pressable>

      <View style={styles.modal}>
        <Text style={styles.title}>지역 선택</Text>
        <View style={styles.row}>
          {REGION_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.option,
                selectedRegions.includes(option) && styles.selectedOption,
              ]}
              onPress={() => handleRegionSelect(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedRegions.includes(option) && styles.selectedText,
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
    backgroundColor: Theme.colors.shadow,
  },
  modal: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: Theme.colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.fontSizes.lg,
    fontWeight: Theme.fontWeights.semibold,
    marginBottom: Theme.spacing.md,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  option: {
    width: "18%", 
    marginBottom: Theme.spacing.sm,
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
