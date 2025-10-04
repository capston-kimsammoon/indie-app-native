import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import Theme from "@/constants/Theme";

type VenueCardProps = {
  id: string;
  name: string;
  region: string;
  profileUrl: string;
  onPress: () => void;
};

export default function VenueCard({ name, profileUrl, onPress }: VenueCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={profileUrl ? { uri: profileUrl } : require('@/assets/images/modie-sample.png')} style={styles.image} />
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
  },
  image: { 
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
   },
  name: {
    fontSize: Theme.fontSizes.lg,
    fontWeight: Theme.fontWeights.medium,
    color: Theme.colors.black,
  },
});
