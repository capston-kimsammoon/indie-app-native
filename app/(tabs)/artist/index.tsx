// app/(tabs)/artist/index.tsx
import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useArtists } from '@/context/ArtistContext';

import Theme from "@/constants/Theme";
import ArtistCard from "@/components/cards/ArtistCard";
import { fetchArtistList } from "@/api/ArtistApi";
import { Artist } from "@/types/artist";
import { like, unlike, TYPE_ARTIST } from "@/api/LikeApi";

export default function ArtistListPage() {
    const router = useRouter();

    //const [artists, setArtists] = useState<Artist[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [liked, setLiked] = useState(false);

    const { artists, setArtists } = useArtists();

    // 아티스트 리스트 가져오기
    const loadArtists = async (nextPage: number = 1) => {
        if (loading || nextPage > totalPages) return;
        setLoading(true);
        try {
            const res = await fetchArtistList(nextPage, 20); // page, size
            setArtists((prev) => [...prev, ...res.artists]);
            setTotalPages(res.totalPages);
            setPage(nextPage);
        } catch (err) {
            console.error("Artist list fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadArtists(1); // 초기 1페이지
    }, []);

    const handleLoadMore = () => {
        if (page < totalPages) {
            loadArtists(page + 1);
        }
    };

    // 찜 ON/OFF 처리
    const handleToggleLike = async (artistId: number, currentLiked: boolean) => {
        const newLiked = !currentLiked;

        try {
            if (newLiked) await like(TYPE_ARTIST, artistId);
            else await unlike(TYPE_ARTIST, artistId);

            setArtists(prev =>
                prev.map(a => (a.id === artistId ? { ...a, isLiked: newLiked } : a))
            );
        } catch (err: any) {
            console.error("artist 찜 처리 실패:", err.response?.data || err.message);
        }
    };

    // 중복 제거된 artists 만들기
    const uniqueArtists = Array.from(new Map(artists.map(a => [a.id, a])).values());

    return (
        <View style={styles.container}>
            <FlatList
                data={uniqueArtists}
                keyExtractor={(item, index) => `artist-${item.id ?? 'noid'}-${index}`}
                renderItem={({ item }) => (
                    <ArtistCard
                        id={item.id.toString()}
                        name={item.name}
                        profileUrl={item.image_url}
                        liked={item.isLiked}
                        onPress={() => router.push(`/artist/${item.id}`)}
                        onToggleLike={() => handleToggleLike(item.id, item.isLiked)}
                    />
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    loading ? <ActivityIndicator style={{ margin: 10 }} /> : null
                }
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.white },
    separator: { height: 1, backgroundColor: Theme.colors.lightGray },
});
