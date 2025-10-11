// app/login/email.tsx
import React, { useState } from "react";
import { View, TextInput, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { emailSignup } from "@/api/AuthApi";
import { fetchUserInfo } from "@/api/UserApi";
import { useAuthStore } from "@/src/state/authStore";
import Theme from "@/constants/Theme";

export default function EmailSignupScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [nickname, setNickname] = useState("");

  const onSubmit = async () => {
    try {
      const emailTrim = email.trim();
      if (!emailTrim || !pw) {
        Alert.alert("회원가입", "이메일과 비밀번호를 입력해 주세요.");
        return;
      }
      await emailSignup(emailTrim, pw, nickname.trim() || undefined);
      const me = await fetchUserInfo();
      setUser(me);
      router.replace("/");
    } catch (e: any) {
      Alert.alert("회원가입", e?.response?.data?.detail || e?.message || "실패했어요.");
    }
  };

  return (
    <View style={s.wrap}>
      <Text style={s.title}>이메일 회원가입</Text>

      <TextInput
        placeholder="이메일"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={s.input}
      />

      <TextInput
        placeholder="비밀번호"
        secureTextEntry
        value={pw}
        onChangeText={setPw}
        style={s.input}
      />

      <TextInput
        placeholder="닉네임(선택)"
        value={nickname}
        onChangeText={setNickname}
        style={s.input}
      />

      <Pressable onPress={onSubmit} style={s.btn}>
        <Text style={s.btnTxt}>가입하기</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, marginBottom: 12 },
  btn: { backgroundColor: Theme.colors.themeOrange, padding: 14, borderRadius: 12, alignItems: "center", marginTop: 4 },
  btnTxt: { color: "#fff", fontWeight: "600" },
});
