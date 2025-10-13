// app/onboarding/profile.tsx
import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import Theme from "@/constants/Theme";
import { completeProfile, fetchUserInfo } from "@/api/UserApi";
import { useAuthStore } from "@/src/state/authStore";

const NICK_MAX = 10;
const NICK_RE = /^[0-9A-Za-z가-힣]+$/u;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);

  const valid = useMemo(() => {
    if (!nickname) return false;
    if (nickname.length > NICK_MAX) return false;
    return NICK_RE.test(nickname);
  }, [nickname]);

  const hint = "닉네임은 한/영/숫자만, 최대 10자\n(공백 · 특수문자 · 이모티콘 불가)";

  const onSave = async () => {
    if (!valid) return;
    
    try {
      setSaving(true);
      console.log("[PROFILE] Current user:", user);
      console.log("[PROFILE] Completing profile with nickname:", nickname);
      
      // 프로필 완료 API 호출
      const result = await completeProfile(true, nickname.trim());
      console.log("[PROFILE] Complete result:", result);
      
      // 사용자 정보 업데이트
      if (result?.user) {
        console.log("[PROFILE] Updating user with:", result.user);
        setUser(result.user);
        
        // 상태가 제대로 업데이트되었는지 확인
        setTimeout(() => {
          const currentUser = useAuthStore.getState().user;
          console.log("[PROFILE] User after update:", currentUser);
          console.log("[PROFILE] is_completed:", currentUser?.is_completed);
        }, 50);
      } else {
        console.log("[PROFILE] No user in result, fetching...");
        const me = await fetchUserInfo();
        console.log("[PROFILE] Fetched user:", me);
        if (me) {
          setUser(me);
        }
      }
      
      // 네비게이션
      console.log("[PROFILE] Navigating to home...");
      setTimeout(() => {
        router.replace("/");
      }, 200);  
      
    } catch (e: any) {
      console.error("[PROFILE] Error:", e);
      setSaving(false);
      const msg = e?.response?.data?.detail || e?.message || "프로필 설정 실패";
      Alert.alert("프로필", msg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>프로필을 설정해 주세요</Text>
      <Text style={styles.desc}>{hint}</Text>

      <TextInput
        value={nickname}
        onChangeText={(t) => setNickname(t.replace(/\s/g, ""))}
        placeholder="닉네임"
        maxLength={NICK_MAX}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        returnKeyType="done"
        onSubmitEditing={onSave}
        editable={!saving}
      />

      <Text style={styles.counter}>
        {nickname.length}/{NICK_MAX}
      </Text>

      <Pressable
        onPress={onSave}
        disabled={!valid || saving}
        style={[
          styles.nextBtn,
          (!valid || saving) && { backgroundColor: Theme.colors.lightGray },
        ]}
      >
        <Text style={styles.nextText}>완료</Text>
        {saving && <ActivityIndicator color="#fff" style={{ marginLeft: 6 }} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 24, paddingTop: 28 },
  title: { fontSize: 20, fontWeight: "700", color: Theme.colors.black },
  desc: { marginTop: 8, color: "#6B7280", lineHeight: 20 },
  input: {
    marginTop: 24,
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  counter: { alignSelf: "flex-end", color: Theme.colors.gray, marginTop: 6, fontSize: 12 },
  nextBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: Theme.colors.themeOrange,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
    marginBottom: 20,
    flexDirection: "row",
  },
  nextText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});