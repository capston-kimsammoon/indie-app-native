import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import Theme from "@/constants/Theme";
import IcChevronDown from "@/assets/icons/ic-chevron-down.svg";

type Props = {
  label: string;
  onPress: () => void;
};

export default function FilterButton({ label, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View style={styles.row}>
        <Text style={styles.text}>{label}</Text>
        <IcChevronDown width={Theme.iconSizes.sm} height={Theme.iconSizes.sm} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: Theme.spacing.sm,
    borderRadius: 20,
    marginRight: Theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  text: {
    fontSize: Theme.fontSizes.base,
    color: Theme.colors.darkGray,
  },
});
