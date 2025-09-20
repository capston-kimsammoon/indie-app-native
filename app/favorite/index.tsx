import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, Image, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { BellOff, Heart, HeartOff, BellRing } from "lucide-react-native";
import Theme from "@/constants/Theme";
import Header from "@/components/layout/Header"; 

type Perf = {
  id: number;
  title: string;
  venue: string;
  date: string;
  posterUrl: string;
};

type Artist = {
  id: number;
  name: string;
  avatar: string;
  notify: boolean;
};

export default function FavoritePage() {
  const router = useRouter();
  const pathname = usePathname();

  const [perfFavs, setPerfFavs] = useState<Perf[]>([
    {
      id: 1,
      title: "A Place Called Sound",
      venue: "코멘터리 사운드",
      date: "2025.05.06 화요일",
      posterUrl:
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=640",
    },
    {
      id: 2,
      title: "SOUND ATTACK",
      venue: "HONGDAE BENDER",
      date: "2025.04.26 토요일",
      posterUrl:
        "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?w=640",
    },
    {
      id: 3,
      title: "FIRST UNPLUGGED",
      venue: "신촌 스팀펑크락",
      date: "2025.05.11 일요일",
      posterUrl:
        "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?w=640",
    },
  ]);

  const [artistFavs, setArtistFavs] = useState<Artist[]>([
    { id: 1, name: "하츄핑", avatar: "https://placekitten.com/100/100", notify: true },
    { id: 2, name: "양대핑", avatar: "https://placekitten.com/101/101", notify: false },
    { id: 3, name: "꾸래핑", avatar: "https://placekitten.com/102/102", notify: true },
    { id: 4, name: "포실포실핑", avatar: "https://placekitten.com/103/103", notify: false },
  ]);

  const [selectedTab, setSelectedTab] = useState<"performance" | "artist">("performance");

  const onTogglePerfHeart = (id: number) => setPerfFavs(prev => prev.filter(p => p.id !== id));
  const onToggleArtistHeart = (id: number) => setArtistFavs(prev => prev.filter(a => a.id !== id));
  const onToggleArtistNotify = (id: number) =>
    setArtistFavs(prev => prev.map(a => (a.id === id ? { ...a, notify: !a.notify } : a)));

  const TabHeader = useMemo(
    () => (
      <View style={styles.tabRow}>
        <Pressable onPress={() => setSelectedTab("performance")} hitSlop={8}>
          <Text style={[styles.tabText, selectedTab === "performance" ? styles.tabActive : styles.tabInactive]}>
            공연
          </Text>
        </Pressable>
        <Pressable onPress={() => setSelectedTab("artist")} hitSlop={8}>
          <Text style={[styles.tabText, selectedTab === "artist" ? styles.tabActive : styles.tabInactive]}>
            아티스트
          </Text>
        </Pressable>
      </View>
    ),
    [selectedTab]
  );

  return (
    <View style={styles.container}>


      {TabHeader}

      <ScrollView style={styles.scroll}>
        {selectedTab === "performance" ? (
          perfFavs.length === 0 ? (
            <Empty text="찜한 공연이 없어요." />
          ) : (
            perfFavs.map((p) => (
              <View key={p.id} style={styles.row}>
                <Image source={{ uri: p.posterUrl }} style={styles.perfThumb} />
                <View style={styles.flex1}>
                  <Text style={styles.perfTitle} numberOfLines={1}>{p.title}</Text>
                  <Text style={styles.perfVenue} numberOfLines={1}>{p.venue}</Text>
                  <Text style={styles.perfDate}>{p.date}</Text>
                </View>
                <Pressable onPress={() => onTogglePerfHeart(p.id)} hitSlop={8} style={styles.heartOutlineCircle}>
                  <Heart size={Theme.iconSizes.sm} color="#EF4444" fill="#EF4444" />
                </Pressable>
              </View>
            ))
          )
        ) : artistFavs.length === 0 ? (
          <Empty text="찜한 아티스트가 없어요." />
        ) : (
          artistFavs.map((a) => (
            <View key={a.id} style={styles.row}>
              <Image source={{ uri: a.avatar }} style={styles.avatar} />
              <Text style={[styles.flex1, styles.artistName]} numberOfLines={1}>{a.name}</Text>

              <Pressable onPress={() => onToggleArtistNotify(a.id)} hitSlop={8} style={styles.notifyPill}>
                <Text style={[styles.notifyText, a.notify ? styles.notifyTextOn : styles.notifyTextOff]}>
                  공연알림
                </Text>
                {a.notify ? (
                  <BellRing size={Theme.iconSizes.sm} color={Theme.colors.themeOrange} style={{ marginLeft: 6 }} />
                ) : (
                  <BellOff size={Theme.iconSizes.sm} color={Theme.colors.gray} style={{ marginLeft: 6 }} />
                )}
              </Pressable>
              <Pressable onPress={() => onToggleArtistHeart(a.id)} hitSlop={8} style={styles.heartOutlineCircle}>
                <Heart size={Theme.iconSizes.sm} color="#EF4444" fill="#EF4444" />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <View style={styles.emptyBox}>
      <HeartOff size={Theme.iconSizes.lg} color={Theme.colors.gray} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.white },

  tabRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 120,
    paddingVertical: Theme.spacing.md,
  },
  tabText: { 
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.medium,
  },
  tabActive: {
    color: Theme.colors.themeOrange,
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.themeOrange,
    paddingBottom: 4,
  },
  tabInactive: {
    color: Theme.colors.darkGray,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    paddingBottom: 4,
  },

  scroll: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.lightGray,
  },
  flex1: { flex: 1 },

  perfThumb: { 
    width: "20%", 
    aspectRatio: 3/4,
    borderRadius: 5,
    marginRight: Theme.spacing.md 
  },
  perfTitle: { 
    fontWeight: Theme.fontWeights.semibold, 
    fontSize: Theme.fontSizes.base, 
    color: Theme.colors.black 
  },
  perfVenue: { 
    color: Theme.colors.black, 
    marginTop: Theme.spacing.sm,
    fontSize: Theme.fontSizes.sm,
    fontWeight: Theme.fontWeights.regular, 
  },
  perfDate: { 
    color: Theme.colors.darkGray, 
    marginTop: Theme.spacing.xs,
    fontSize: Theme.fontSizes.sm,
    fontWeight: Theme.fontWeights.light, 
  },

  avatar: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    marginRight: Theme.spacing.sm 
  },
  artistName: { 
    fontSize: Theme.fontSizes.base, 
    fontWeight: Theme.fontWeights.medium, 
    color: Theme.colors.black 
  },

  notifyPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.sm,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray, 
    marginRight: Theme.spacing.sm,
    backgroundColor: Theme.colors.white,
  },
  notifyText: { 
    fontSize: Theme.fontSizes.sm,
    fontWeight: Theme.fontWeights.regular,
  },
  notifyTextOff: { 
    color: Theme.colors.darkGray, 
  },
  notifyTextOn: { 
    color: Theme.colors.themeOrange, 
  },

  heartOutlineCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.white,
  },

  emptyBox: { alignItems: "center", justifyContent: "center", paddingVertical: Theme.spacing.md },
  emptyText: { color: Theme.colors.gray, marginTop: Theme.spacing.md },
});
