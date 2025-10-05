import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

import Theme from "@/constants/Theme";
import PerformanceCard from "@/components/cards/PerformanceCard";
import VenueCard from "@/components/cards/VenueCard";
import ArtistCard from "@/components/cards/ArtistCard";

import fetchSearchResults from "@/api/SearchApi";
import { like, unlike } from "@/api/LikeApi";
import { requireLogin } from "@/utils/auth";

import { PerformanceSearchItem, VenueSearchItem, ArtistSearchItem } from "@/types/search";
import { getDateFromDateString, getWeekDayFromDateString } from "@/utils/dateUtils";

const RECENT_KEY = "recent_searches";

export default function SearchPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"performance" | "venue" | "artist">("performance");
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const [filteredPerformances, setFilteredPerformances] = useState<PerformanceSearchItem[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<VenueSearchItem[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<ArtistSearchItem[]>([]);

  /** 최근 검색어 로드 */
  useEffect(() => {
    const loadRecent = async () => {
      try {
        const saved = await AsyncStorage.getItem(RECENT_KEY);
        if (saved) setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.warn("최근 검색어 로드 실패", e);
      }
    };
    loadRecent();
  }, []);

  /** 최근 검색어 저장 */
  const saveRecent = async (list: string[]) => {
    try {
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn("최근 검색어 저장 실패", e);
    }
  };

  /** 검색 실행 */
  const handleSearch = async (searchTerm?: string) => {
    const q = searchTerm ?? query;
    if (!q.trim()) {
      clearSearch();
      return;
    }

    setIsSearching(true);
    setQuery(q);
    setLoading(true);

    // 최근 검색어 업데이트
    setRecentSearches(prev => {
      const updated = [q, ...prev.filter(item => item !== q)].slice(0, 10);
      saveRecent(updated);
      return updated;
    });

    try {
      if (activeTab === "performance") {
        const res = await fetchSearchResults.performance(q);
        setFilteredPerformances(
          res.performance.map(p => ({
            id: p.id.toString(),
            title: p.title,
            venue: p.venue,
            date: p.date,
            posterUrl: p.image_url,
          }))
        );
      } else if (activeTab === "venue") {
        const res = await fetchSearchResults.venue(q);
        console.log("🎯 [DEBUG] 공연장 검색 응답:", res);
        setFilteredVenues(
          res.venues.map(v => ({
            id: v.id.toString(),
            name: v.name,
            address: v.address,
            profileUrl: v.image_url,
          }))
        );
      } else {
        try {
          const res = await fetchSearchResults.artist(q);
          setFilteredArtists(
            res.artists.map(a => ({
              id: a.id.toString(),
              name: a.name,
              profileUrl: a.profile_url,
              liked: a.isLiked ?? false,
            }))
          );
        } catch (err: any) {
          // 401 무시하고 liked: false
          if (err.response?.status === 401) {
            console.warn("비로그인 상태 검색: 아티스트 liked는 false 처리");
            const res = await fetchSearchResults.artist(q, { ignoreAuth: true });
            setFilteredArtists(
              res.artists.map(a => ({
                id: a.id.toString(),
                name: a.name,
                profileUrl: a.profile_url,
                liked: false,
              }))
            );
          } else {
            throw err;
          }
        }
      }
    } catch (err) {
      console.warn("검색 실패", err);
    } finally {
      setLoading(false);
    }
  };

  /** 최근 검색어 클릭 */
  const handleRecentClick = (keyword: string) => {
    handleSearch(keyword);
  };

  /** 개별 삭제 */
  const removeRecent = (keyword: string) => {
    const updated = recentSearches.filter(item => item !== keyword);
    setRecentSearches(updated);
    saveRecent(updated);
  };

  /** 전체 삭제 */
  const clearRecent = () => {
    setRecentSearches([]);
    saveRecent([]);
  };

  /** 검색 초기화 */
  const clearSearch = () => {
    setQuery("");
    setIsSearching(false);
    setFilteredPerformances([]);
    setFilteredVenues([]);
    setFilteredArtists([]);
  };

  /** 리스트 데이터 구성 (섹션 + 아이템) */
  const listData: { type: string; title?: string; data?: any }[] = [];

  if (activeTab === "performance") {
    if (filteredPerformances.length > 0) {
      listData.push({ type: "section", title: "공연" });
      filteredPerformances.forEach(item => listData.push({ type: "performance", data: item }));
    } else if (isSearching) {
      listData.push({ type: "empty", data: `'${query}'와(과) 일치하는 공연이 없습니다.` });
    }
  } else if (activeTab === "venue") {
    if (filteredVenues.length > 0) {
      listData.push({ type: "section", title: "공연장" });
      filteredVenues.forEach(item => listData.push({ type: "venue", data: item }));
    } else if (isSearching) {
      listData.push({ type: "empty", data: `'${query}'와(과) 일치하는 공연장이 없습니다.` });
    }
  } else if (activeTab === "artist") {
    if (filteredArtists.length > 0) {
      listData.push({ type: "section", title: "아티스트" });
      filteredArtists.forEach(item => listData.push({ type: "artist", data: item }));
    } else if (isSearching) {
      listData.push({ type: "empty", data: `'${query}'와(과) 일치하는 아티스트가 없습니다.` });
    }
  }

  useEffect(() => {
    if (isSearching && query.trim()) {
      handleSearch(query);
    }
  }, [activeTab]);

  return (
    <View style={styles.container}>
      {/* 검색창 */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="검색어를 입력하세요"
          value={query}
          onChangeText={setQuery}
          placeholderTextColor={Theme.colors.gray}
          onSubmitEditing={() => handleSearch()}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.searchButton}>
            <MaterialIcons name="close" size={20} color={Theme.colors.gray} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => handleSearch()} style={styles.searchButton}>
          <MaterialIcons name="search" size={24} color={Theme.colors.themeOrange} />
        </TouchableOpacity>
      </View>

      {/* 최근 검색어 */}
      {!isSearching && recentSearches.length > 0 && (
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>최근 검색어</Text>
            <TouchableOpacity onPress={clearRecent}>
              <Text style={styles.clearAll}>전체 삭제</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            data={recentSearches}
            keyExtractor={(item, idx) => item + idx}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentList}
            renderItem={({ item }) => (
              <View style={styles.recentItemContainer}>
                <TouchableOpacity style={styles.recentItemButton} onPress={() => handleRecentClick(item)}>
                  <Text style={styles.recentItem}>{item}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeRecent(item)} style={styles.deleteButton}>
                  <MaterialIcons name="close" size={16} color={Theme.colors.black} />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      {/* 검색 결과 */}
      {isSearching && (
        <>
          {/* 탭 */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "performance" && styles.activeTab]}
              onPress={() => setActiveTab("performance")}
            >
              <Text style={[styles.tabText, activeTab === "performance" && styles.activeTabText]}>
                공연
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "venue" && styles.activeTab]}
              onPress={() => setActiveTab("venue")}
            >
              <Text style={[styles.tabText, activeTab === "venue" && styles.activeTabText]}>
                공연장
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "artist" && styles.activeTab]}
              onPress={() => setActiveTab("artist")}
            >
              <Text style={[styles.tabText, activeTab === "artist" && styles.activeTabText]}>
                아티스트
              </Text>
            </TouchableOpacity>
          </View>


          <FlatList
            data={listData}
            keyExtractor={(item, idx) => {
              if (item.type === "section") return `section-${item.title ?? idx}`;
              if (item.type === "empty") return `empty-${idx}`;
              return `${item.data.id}-${item.type}`;
            }}
            renderItem={({ item, index }) => {
              const nextItem = listData[index + 1];
              const isLastInSection = !nextItem || nextItem.type === "section";

              if (item.type === "empty") return <Text style={styles.emptyText}>{item.data}</Text>;
              if (item.type === "performance") {
                return (
                  <>
                    <PerformanceCard
                      type="list"
                      title={item.data.title}
                      venue={item.data.venue}
                      date={`${getDateFromDateString(item.data.date)} ${getWeekDayFromDateString(item.data.date)}`}
                      posterUrl={item.data.posterUrl}
                      onPress={() => router.push(`/performance/${item.data.id}`)}
                    />
                    {!isLastInSection && <View style={styles.separator} />}
                  </>
                );
              }
              if (item.type === "venue") {
                return (
                  <>
                    <VenueCard
                      id={item.data.id}
                      name={item.data.name}
                      profileUrl={item.data.profileUrl}
                      region={item.data.region}
                      onPress={() => router.push(`/venue/${item.data.id}`)}
                    />
                    {!isLastInSection && <View style={styles.separator} />}
                  </>
                );
              }
              if (item.type === "artist") {
                return (
                  <>
                    <ArtistCard
                      id={item.data.id}
                      name={item.data.name}
                      profileUrl={item.data.profileUrl}
                      liked={item.data.liked}
                      onPress={() => router.push(`/artist/${item.data.id}`)}
                      onToggleLike={() => {
                        requireLogin(async () => {
                          try {
                            if (item.data.liked) {
                              await unlike("artist", Number(item.data.id));
                            } else {
                              await like("artist", Number(item.data.id));
                            }
                            setFilteredArtists(prev =>
                              prev.map(a =>
                                a.id === item.data.id ? { ...a, liked: !a.liked } : a
                              )
                            );
                          } catch (err: any) {
                            console.warn("하트 토글 실패", err);
                          }
                        });
                      }}
                    />
                    {!isLastInSection && <View style={styles.separator} />}
                  </>
                );
              }
              return null;
            }}
            contentContainerStyle={{ paddingBottom: Theme.spacing.md }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.white },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Theme.spacing.md,
    marginTop: Theme.spacing.md,
    borderBottomWidth: 2,
    borderColor: Theme.colors.themeOrange,
  },
  input: {
    flex: 1,
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.medium,
    color: Theme.colors.black,
  },
  searchButton: { padding: Theme.spacing.xs },
  recentContainer: { padding: Theme.spacing.md },
  recentHeader: { flexDirection: "row", justifyContent: "space-between", marginVertical: Theme.spacing.md },
  recentTitle: { fontSize: Theme.fontSizes.base, fontWeight: Theme.fontWeights.semibold, color: Theme.colors.black },
  clearAll: { fontSize: Theme.fontSizes.sm, color: Theme.colors.gray },
  recentList: { flexDirection: "row", gap: 8 },
  recentItemContainer: { flexDirection: "row", alignItems: "center", padding: Theme.spacing.sm, backgroundColor: Theme.colors.lightGray, borderRadius: 16 },
  recentItemButton: { gap: 4 },
  recentItem: { fontSize: Theme.fontSizes.sm, fontWeight: Theme.fontWeights.regular, color: Theme.colors.black },
  deleteButton: { marginLeft: Theme.spacing.sm },
  tabBar: { flexDirection: "row", borderBottomWidth: 1, borderColor: Theme.colors.lightGray, margin: Theme.spacing.md },
  tabButton: { flex: 1, paddingVertical: Theme.spacing.md, alignItems: "center" },
  activeTab: { borderBottomWidth: 2, borderColor: Theme.colors.themeOrange },
  tabText: { fontSize: Theme.fontSizes.base, fontWeight: Theme.fontWeights.medium, color: Theme.colors.darkGray },
  activeTabText: { color: Theme.colors.themeOrange, fontWeight: Theme.fontWeights.bold },
  sectionTitle: { fontSize: Theme.fontSizes.lg, fontWeight: Theme.fontWeights.bold, padding: Theme.spacing.md },
  emptyText: { fontSize: Theme.fontSizes.base, color: Theme.colors.gray, margin: Theme.spacing.md },
  separator: { height: 1, backgroundColor: Theme.colors.lightGray },
});
