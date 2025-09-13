import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet } from "react-native";
import PerformanceCard from "@/components/cards/PerformanceCard";
import Theme from "@/constants/Theme";
import IcCalendar from "@/assets/icons/ic-calendar.svg";

type PerformanceItem = {
  id: string;
  title: string;
  venue: string;
  date: string;
  posterUrl: any;
};

type Props = {
  data: PerformanceItem[];
  onPressItem: (item: PerformanceItem) => void;
};

export default function PerformanceListPage({ data, onPressItem }: Props) {
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [regionModalVisible, setRegionModalVisible] = useState(false);

  const SORT_OPTIONS = ["최근등록순", "공연임박순", "인기많은순"];
  const REGION_OPTIONS = ["전체","서울","경기","인천","부산","대구","광주","대전","울산","세종","강원","충청","전라","경상","제주"];

  return (
    <View style={{ flex: 1 }}>

      {/* 필터 */}
      <View style={styles.filterRow}>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity style={styles.filterButton} onPress={() => setSortModalVisible(true)}>
            <Text>정렬</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={() => setRegionModalVisible(true)}>
            <Text>지역</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <IcCalendar width={24} height={24} />
        </TouchableOpacity>
      </View>

      {/* 리스트 */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onPressItem(item)}>
            <PerformanceCard
              type="list"
              title={item.title}
              venue={item.venue}
              date={item.date}
              posterUrl={item.posterUrl}
            />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: Theme.colors.lightGray }} />}
      />

      {/* 정렬 모달 */}
      <Modal visible={sortModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity key={option} onPress={() => setSortModalVisible(false)}>
                <Text style={styles.modalText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* 지역 모달 */}
      <Modal visible={regionModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <View style={styles.regionGrid}>
              {REGION_OPTIONS.map((region) => (
                <TouchableOpacity key={region} style={styles.regionButton} onPress={() => setRegionModalVisible(false)}>
                  <Text style={styles.modalText}>{region}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: Theme.spacing.md,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: Theme.fontSizes.lg,
    fontWeight: Theme.fontWeights.semibold,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
  },
  filterButton: {
    backgroundColor: Theme.colors.lightGray,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: 5,
    marginRight: Theme.spacing.sm,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Theme.colors.white,
    padding: Theme.spacing.md,
    borderRadius: 8,
    width: "80%",
  },
  modalText: {
    fontSize: Theme.fontSizes.sm,
    paddingVertical: Theme.spacing.xs,
  },
  regionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  regionButton: {
    width: "30%",
    backgroundColor: Theme.colors.lightGray,
    paddingVertical: Theme.spacing.xs,
    marginVertical: Theme.spacing.xs / 2,
    alignItems: "center",
    borderRadius: 5,
  },
});
