// app/login/find-id.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Theme from "@/constants/Theme";
import { findLoginIdByEmail } from "@/api/AuthApi";
import EmailVerification from "@/components/auth/EmailVerification";

type Step = "input" | "verify" | "result";

export default function FindIdScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("input");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [accountInfo, setAccountInfo] = useState<any>(null);

  const validateEmail = (text: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(text);
  };

  const onNext = () => {
    if (!email.trim()) {
      Alert.alert("아이디 찾기", "이메일을 입력해 주세요.");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("아이디 찾기", "올바른 이메일 형식을 입력해 주세요.");
      return;
    }

    setStep("verify");
  };

  const onVerified = useCallback(async () => {
    try {
      setLoading(true);
      const data = await findLoginIdByEmail(email);
      setAccountInfo(data);
      setStep("result");
    } catch (e: any) {
      const detail = e?.response?.data?.detail || e?.message || "계정을 찾을 수 없습니다.";
      Alert.alert("아이디 찾기", detail);
      setStep("input");
    } finally {
      setLoading(false);
    }
  }, [email]);

  const onCancelVerification = () => {
    setStep("input");
  };

  const maskLoginId = (id: string) => {
    if (!id) return "";
    const len = id.length;
    if (len <= 4) return id[0] + "***"; // 너무 짧을 경우
    return id.slice(0, 2) + "***" + id.slice(-2); // 예: ab***34
  };

  // 결과 화면
  if (step === "result" && accountInfo) {
    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          <Ionicons
            name="checkmark-circle"
            size={48}
            color={Theme.colors.themeOrange}
            style={styles.resultIcon}
          />
          <Text style={styles.resultTitle}>가입된 계정을 찾았습니다</Text>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>아이디</Text>
              <Text style={styles.infoValue}>{maskLoginId(accountInfo.login_id)}</Text>
            </View>
            {accountInfo.nickname && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>닉네임</Text>
                <Text style={styles.infoValue}>{accountInfo.nickname}</Text>
              </View>
            )}
            {accountInfo.createdAt && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>가입일</Text>
                <Text style={styles.infoValue}>
                  {new Date(accountInfo.createdAt).toLocaleDateString("ko-KR")}
                </Text>
              </View>
            )}
          </View>

          <Pressable
            onPress={() => router.replace("/login")}
            style={styles.loginBtn}
          >
            <Text style={styles.loginBtnText}>로그인하러 가기</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/login/find-password")}
            style={styles.findPwBtn}
          >
            <Text style={styles.findPwBtnText}>비밀번호 찾기</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // 인증 화면
  if (step === "verify") {
    return (
      <View style={styles.container}>
        <EmailVerification
          email={email}
          purpose="reset_password"
          onVerified={onVerified}
          onCancel={onCancelVerification}
        />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Theme.colors.themeOrange} />
          </View>
        )}
      </View>
    );
  }

  // 입력 화면
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formArea}>
          <Text style={styles.title}>아이디 찾기</Text>
          <Text style={styles.description}>
            가입 시 사용한 이메일을 입력해 주세요.{"\n"}
            인증 후 아이디를 확인할 수 있습니다.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="example@modie.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.input}
              editable={!loading}
              returnKeyType="done"
              onSubmitEditing={onNext}
            />
          </View>
        </View>
      </ScrollView>

      {/* 화면 하단 버튼 */}
      <View style={styles.bottomBtnWrapper}>
        <Pressable
          onPress={onNext}
          style={({ pressed }) => [
            styles.findBtn,
            pressed && { opacity: 0.9 },
            loading && { opacity: 0.6 },
          ]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.findBtnText}>다음</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    justifyContent: 'space-between',
  },
  scrollContent: {
    padding: Theme.spacing.md,
  },
  formArea: {
  },
  bottomBtnWrapper: {
    padding: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.fontSizes.lg,
    fontWeight: Theme.fontWeights.semibold,
    color: Theme.colors.black,
    marginBottom: Theme.spacing.sm,
  },
  description: {
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.regular,
    color: Theme.colors.darkGray,
    marginBottom: Theme.spacing.lg,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: Theme.spacing.lg,
  },
  label: {
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.semibold as any,
    color: Theme.colors.black,
    marginBottom: Theme.spacing.sm,
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    paddingHorizontal: Theme.spacing.md,
    fontSize: Theme.fontSizes.base,
    backgroundColor: "#fff",
  },
  findBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: Theme.colors.themeOrange,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Theme.spacing.lg,
  },
  findBtnText: {
    color: "#fff",
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.semibold as any,
  },
  resultContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Theme.spacing.md,
  },
  resultIcon: {
    marginBottom: Theme.spacing.md,
  },
  resultTitle: {
    fontSize: Theme.fontSizes.lg,
    fontWeight: Theme.fontWeights.semibold as any,
    color: Theme.colors.black,
    marginBottom: Theme.spacing.md,
  },
  infoBox: {
    width: "100%",
    backgroundColor: Theme.colors.lightGray + "20",
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: 12,
    marginBottom: Theme.spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
  },
  infoLabel: {
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.regular,
    color: Theme.colors.darkGray,
  },
  infoValue: {
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.medium as any,
    color: Theme.colors.black,
  },
  loginBtn: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    backgroundColor: Theme.colors.themeOrange,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.spacing.md,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.semibold as any,
  },
  findPwBtn: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  findPwBtnText: {
    color: Theme.colors.black,
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.semibold as any,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
});