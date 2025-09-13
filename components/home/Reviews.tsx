// components/home/Reviews.tsx
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import Theme from "@/constants/Theme";
import PerformanceCard from "@/components/cards/PerformanceCard";
import IcChevronRight from "@/assets/icons/ic-chevron-right.svg";

const REVIEW_ITEMS = [
  {
    id: "1",
    title: "｢누구의 집｣ 오픈 마이크",
    reviewTitle: "최애 공연 갱신",
    reviewContent: "이 공연은 정말 미쳤어요 ... 제 눈으로 볼 수 있어서 너무너무 다행이에요...... 플리에 당장 넣었어요",
    userName: "하츄핑",
    posterUrl: require('../../assets/images/sample-poster1.jpeg')
  },
  {
    id: "2",
    title: "｢누구의 집｣ 오픈 마이크22",
    reviewTitle: "최애 공연 갱신",
    reviewContent: "이 공연은 정말 미쳤어요 ... 제 눈으로 볼 수 있어서 너무너무 다행이에요...... 플리에 당장 넣었어요",
    userName: "하츄핑",
    posterUrl: require('../../assets/images/sample-poster1.jpeg') 
  },
];

export default function Reviews({ onPress }: { onPress?: () => void }) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>관람 후기</Text>
        {onPress && (
          <TouchableOpacity onPress={onPress} style={styles.moreButton}>
              <IcChevronRight width={Theme.iconSizes.md} height={Theme.iconSizes.md} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={REVIEW_ITEMS}
        renderItem={({ item }) => (
          <PerformanceCard
            type="review"
            title={item.title}
            reviewTitle={item.reviewTitle}
            reviewContent={item.reviewContent}
            userName={item.userName}
            posterUrl={item.posterUrl}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: Theme.spacing.md,
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.fontSizes.lg,
    fontWeight: Theme.fontWeights.semibold,
    color: Theme.colors.black,
    textAlign: "center",
  },
  moreButton: {
    position: "absolute",
    right: 0,
  },
  list: {
    paddingBottom: Theme.spacing.sm,
  },
});
