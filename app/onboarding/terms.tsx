import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Alert, Linking, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import Theme from "@/constants/Theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AgreeMap = { age: boolean; service: boolean; privacy: boolean };
const TERMS_KEY = "terms_agreed_local";

export default function TermsScreen() {
  const router = useRouter();
  const [agree, setAgree] = useState<AgreeMap>({ age: false, service: false, privacy: false });
  const [submitting, setSubmitting] = useState(false);

  const allChecked = useMemo(() => Object.values(agree).every(Boolean), [agree]);
  const toggleAll = () => {
    const v = !allChecked;
    setAgree({ age: v, service: v, privacy: v });
  };
  const toggle = (k: keyof AgreeMap) => setAgree((p) => ({ ...p, [k]: !p[k] }));

  const onOpenDoc = async (url?: string) => {
    if (!url) return;
    try {
      const ok = await Linking.canOpenURL(url);
      if (ok) await Linking.openURL(url);
    } catch {
      Alert.alert("안내", "문서를 열 수 없어요.");
    }
  };

  const onNext = async () => {
    if (!allChecked) return;
    try {
      setSubmitting(true);
      await AsyncStorage.setItem(TERMS_KEY, "1");
      router.replace("/onboarding/profile");
    } catch (e: any) {
      Alert.alert("약관 동의", e?.message || "처리에 실패했어요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>서비스 이용을 위해 약관에 동의해 주세요</Text>

      <Pressable style={styles.allRow} onPress={toggleAll} disabled={submitting}>
        <Text style={[styles.checkbox, allChecked && styles.checkboxOn]}>{allChecked ? "☑" : "☐"}</Text>
        <Text style={styles.allLabel}>전체 동의</Text>
      </Pressable>

      <View style={styles.list}>
        <Pressable style={styles.row} onPress={() => toggle("age")} disabled={submitting}>
          <Text style={[styles.checkbox, agree.age && styles.checkboxOn]}>{agree.age ? "☑" : "☐"}</Text>
          <Text style={styles.label}>만 14세 이상 가입 동의 (필수)</Text>
        </Pressable>

        <View style={styles.rowBetween}>
          <Pressable style={styles.rowLeft} onPress={() => toggle("service")} disabled={submitting}>
            <Text style={[styles.checkbox, agree.service && styles.checkboxOn]}>{agree.service ? "☑" : "☐"}</Text>
            <Text style={styles.label}>서비스 이용약관 동의 (필수)</Text>
          </Pressable>
          <Pressable onPress={() => onOpenDoc("")} hitSlop={12}>
            <Text style={styles.link}>보기</Text>
          </Pressable>
        </View>

        <View style={styles.rowBetween}>
          <Pressable style={styles.rowLeft} onPress={() => toggle("privacy")} disabled={submitting}>
            <Text style={[styles.checkbox, agree.privacy && styles.checkboxOn]}>{agree.privacy ? "☑" : "☐"}</Text>
            <Text style={styles.label}>개인정보처리방침 동의 (필수)</Text>
          </Pressable>
          <Pressable onPress={() => onOpenDoc("")} hitSlop={12}>
            <Text style={styles.link}>보기</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        onPress={onNext}
        disabled={!allChecked || submitting}
        style={[
          styles.nextBtn,
          (!allChecked || submitting) && { backgroundColor: Theme.colors.lightGray },
        ]}
      >
        <Text style={styles.nextText}>다음</Text>
        {submitting && <ActivityIndicator color="#fff" style={{ marginLeft: 6 }} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 24, paddingTop: 28 },
  title: { fontSize: 20, fontWeight: "700", color: Theme.colors.black },
  allRow: { flexDirection: "row", alignItems: "center", marginTop: 24, paddingVertical: 8 },
  checkbox: { width: 22, marginRight: 10, fontSize: 18, color: "#9CA3AF" },
  checkboxOn: { color: Theme.colors.themeOrange },
  allLabel: { fontSize: 16, fontWeight: "600", color: Theme.colors.black },
  list: { marginTop: 8 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
  rowLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  label: { fontSize: 15, color: Theme.colors.black },
  link: { color: Theme.colors.gray, fontSize: 13, paddingHorizontal: 8, paddingVertical: 4 },
  nextBtn: {
    height: 50, borderRadius: 12, backgroundColor: Theme.colors.themeOrange,
    alignItems: "center", justifyContent: "center", marginTop: "auto", marginBottom: 20, flexDirection: "row",
  },
  nextText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
