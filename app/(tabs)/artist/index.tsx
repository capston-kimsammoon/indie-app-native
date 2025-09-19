// /app/(tabs)/artist/index.tsx
import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";

import Theme from "@/constants/Theme";

import IcHeartOutline from "@/assets/icons/ic-heart-outline.svg";
import IcHeartFilled from "@/assets/icons/ic-heart-filled.svg";

type Artist = {
    id: string,
    name: string,
    profileUrl: string,
};

const MOCK_ARTISTS: Artist[] = [
    { id: "1", name: "하츄핑", profileUrl: "https://picsum.photos/100/100" },
    { id: "2", name: "앙대핑", profileUrl: "https://picsum.photos/100/100" },
    { id: "3", name: "앙대핑", profileUrl: "https://picsum.photos/100/100" },
    { id: "4", name: "앙대핑", profileUrl: "https://picsum.photos/100/100" },
    { id: "5", name: "앙대핑", profileUrl: "https://picsum.photos/100/100" },
];

export default function ArtistListPage() {
    const navigation = useNavigation();
    const router = useRouter();

    const artists = MOCK_ARTISTS;
    const iconSize = Theme.iconSizes.sm;

    const [likedArtists, setLikedArtists] = useState<{ [key: string]: boolean }>({});

    const toggleLike = (id: string) => {
        setLikedArtists((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={artists}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.artistCard}>
                        <Pressable onPress={() => router.push(`/artist/${item.id}`)} style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                            <Image source={{uri : item.profileUrl}} style={styles.artistProfile} />
                            <Text style={styles.artistName}>{item.name}</Text>
                        </Pressable>
                        
                        {/* 하트 버튼 */}
                        <Pressable style={styles.heartButton} onPress={() => toggleLike(item.id)}>
                            {likedArtists[item.id] ? (
                                <IcHeartFilled width={iconSize} height={iconSize} />
                            ) : (
                                <IcHeartOutline width={iconSize} height={iconSize} />
                            )}
                        </Pressable>

                    </View>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.white,
    },
    flexSpacer: {
        flex: 1,
    },
    artistCard: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: Theme.spacing.sm,
        paddingHorizontal: Theme.spacing.md,
    },
    separator: {
        height: 1,
        backgroundColor: Theme.colors.lightGray,
    },
    artistProfile: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: Theme.spacing.md,
    },
    artistName: {
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
