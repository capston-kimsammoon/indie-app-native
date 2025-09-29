import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import Theme from "@/constants/Theme";
import IcHeartFilled from "@/assets/icons/ic-heart-filled.svg";
import IcHeartOutline from "@/assets/icons/ic-heart-outline.svg";

type ArtistCardProps = {
    id: string;
    name: string;
    profileUrl: string;
    liked: boolean;
    onPress: () => void;
    onToggleLike: () => void;
};

export default function ArtistCard({
    name,
    profileUrl,
    liked,
    onPress,
    onToggleLike,
}: ArtistCardProps) {
    return (
        <View style={styles.card}>
            <Pressable
                onPress={onPress}
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
                <Image source={{ uri: profileUrl }} style={styles.image} />
                <Text style={styles.name}>{name}</Text>
            </Pressable>

            <Pressable style={styles.heartButton} onPress={onToggleLike}>
                {liked ? <IcHeartFilled width={Theme.iconSizes.sm} height={Theme.iconSizes.sm} /> : <IcHeartOutline width={Theme.iconSizes.sm} height={Theme.iconSizes.sm} />}
            </Pressable>
        </View>
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
    },
    name: {
        fontSize: Theme.fontSizes.lg,
        fontWeight: Theme.fontWeights.medium,
        color: Theme.colors.black,
    },
    heartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
},
});
