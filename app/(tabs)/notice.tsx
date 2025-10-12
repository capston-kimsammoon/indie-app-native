import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import Theme from "@/constants/Theme";

const FAQ_ITEMS = [
  {
    question: "'모디'는 어떤 앱인가요?",
    answer: "'모디'는 인디 공연 정보를 모아서 보여주는 서비스입니다. 공연 일정, 장소, 리뷰 등 다양한 정보를 한 눈에 확인할 수 있어요."
  },
  {
    question: "어떤 공연 정보를 제공하나요?",
    answer: "2025년 10월 이후의 공연 정보를 수집하여 제공하며, 공연 상세 정보와 리뷰까지 확인 가능합니다."
  },
  {
    question: "앱 이용 중 문제가 생기면 어떻게 하나요?",
    answer: "고객센터를 통해 문의하시면 빠른 시간 내에 답변드립니다. 문의 내용은 구체적으로 작성해주시면 도움이 됩니다."
  },
];

export default function NoticeScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>공지사항 / FAQ</Text>

      {FAQ_ITEMS.map((item, index) => (
        <View key={index} style={styles.faqItem}>
          <Pressable onPress={() => toggleItem(index)} style={styles.questionRow}>
            <Text style={styles.question}>{item.question}</Text>
            <Text style={styles.toggleIcon}>{openIndex === index ? "-" : "+"}</Text>
          </Pressable>
          {openIndex === index && (
            <View style={styles.answerWrap}>
              <Text style={styles.answer}>{item.answer}</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  title: {
    fontSize: Theme.fontSizes.xl,
    fontWeight: Theme.fontWeights.bold,
    color: Theme.colors.black,
    paddingHorizontal: Theme.spacing.md,
    marginVertical: Theme.spacing.sm,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.lightGray,
    padding: Theme.spacing.md,
  },
  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: {
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.semibold,
    color: Theme.colors.black,
  },
  toggleIcon: {
    fontSize: Theme.fontSizes.lg,
    fontWeight: Theme.fontWeights.bold,
    color: Theme.colors.themeOrange,
  },
  answerWrap: {
    marginTop: Theme.spacing.sm,
  },
  answer: {
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.darkGray,
    lineHeight: 20,
  },
});
