// /components/home/NavigationButtons.tsx
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Theme from "@/constants/Theme";

import IcHomePerformance from "../../assets/icons/ic-home-performance.svg";
import IcHomeVenue from "../../assets/icons/ic-home-venue.svg";
import IcHomeArtist from "../../assets/icons/ic-home-artist.svg";
import IcHomePost from "../../assets/icons/ic-home-post.svg";

type NavButton = {
  label: string;
  icon: any;
  screen: string;
};

const NAV_BUTTONS: NavButton[] = [
  { label: "공연", icon: IcHomePerformance, screen: "performance" },
  { label: "공연장", icon: IcHomeVenue, screen: "venue" },
  { label: "아티스트", icon: IcHomeArtist, screen: "artist" },
  { label: "리뷰", icon: IcHomePost, screen: "review" },
];

export default function NavigationButtons() {
  const router = useRouter();
  const iconSize = Theme.iconSizes.lg;

  return (
    <View style={styles.section}>
      {NAV_BUTTONS.map((item, i) => (
        <View key={i} style={styles.button}>
          <TouchableOpacity
            style={styles.iconWrapper}
            onPress={() => router.push(item.screen)}
          >
            <item.icon fill={Theme.colors.themeOrange} width={iconSize} height={iconSize} />
          </TouchableOpacity>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: Theme.spacing.md,
  },
  button: {
    alignItems: "center",
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: Theme.colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
  },
  label: {
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.black,
    fontWeight: Theme.fontWeights.medium,
  },
});
