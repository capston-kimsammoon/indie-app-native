// app/login/email.tsx
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
import { emailSignupVerified, checkLoginId } from "@/api/AuthApi";
import { useAuthStore } from "@/src/state/authStore";
import EmailVerification from "@/components/auth/EmailVerification";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Step = "input" | "verify";

export default function EmailSignupScreen() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [step, setStep] = useState<Step>("input");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginId, setLoginId] = useState("");
  const [loginIdChecked, setLoginIdChecked] = useState(false);
  const [loginIdAvailable, setLoginIdAvailable] = useState(false);

  const validateEmail = (text: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(text);
  };

  const validateLoginId = (text: string) => {
    const regex = /^[a-zA-Z0-9_]{6,12}$/;
    return regex.test(text);
  };

  const onCheckLoginId = async () => {
    if (!loginId.trim()) {
      Alert.alert("아이디 확인", "아이디를 입력해 주세요.");
      return;
    }

    if (!validateLoginId(loginId)) {
      Alert.alert("아이디 확인", "아이디는 영문, 숫자, _만 사용 가능하며 6~12자여야 합니다.");
      return;
    }

    try {
      setLoading(true);
      const result = await checkLoginId(loginId);
      setLoginIdAvailable(result.available);
      setLoginIdChecked(true);
    } catch (e: any) {
      Alert.alert("아이디 확인", e?.response?.data?.detail || "확인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (text: string) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,18}$/;
    return regex.test(text);
  };

  const onNext = () => {
    if (!loginId.trim()) {
      Alert.alert("회원가입", "아이디를 입력해 주세요.");
      return;
    }
    if (!loginIdChecked || !loginIdAvailable) {
      Alert.alert("회원가입", "아이디 중복 확인을 해주세요.");
      return;
    }
    if (!email.trim()) {
      Alert.alert("회원가입", "이메일을 입력해 주세요.");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("회원가입", "올바른 이메일 형식이 아닙니다.");
      return;
    }
    if (!password) {
      Alert.alert("회원가입", "비밀번호를 입력해 주세요.");
      return;
    }
    if (!validatePassword(password)) {
      Alert.alert(
        "회원가입",
        "비밀번호는 영문, 숫자, 특수문자를 포함한 6~18자여야 합니다."
      );
      return;
    }
    if (password !== passwordConfirm) {
      Alert.alert("회원가입", "비밀번호가 일치하지 않습니다.");
      return;
    }

    setStep("verify");
  };

  // 인증 완료 후 회원가입
  const onVerified = useCallback(async () => {
    try {
      setLoading(true);
      console.log("[SIGNUP] Starting signup process...");

      const tempNickname = `user_${loginId}`;

      const result = await emailSignupVerified(
        loginId.trim(),
        email.trim(),
        password,
        tempNickname
      );
      console.log("[SIGNUP] Signup result:", result);

      const token = result?.accessToken || result?.access;
      if (!token) {
        throw new Error("인증 토큰을 받지 못했습니다.");
      }

      const user = result?.user;
      if (!user) {
        throw new Error("사용자 정보를 받지 못했습니다.");
      }

      console.log("[SIGNUP] Saving token and user...");
      setToken(token);  
      setUser(user);

      // AsyncStorage에도 직접 저장 (백업)
      await AsyncStorage.setItem("access_token", token);
      if (result?.refreshToken) {
        await AsyncStorage.setItem("refresh_token", result.refreshToken);
      }

      setLoading(false);

      console.log("[SIGNUP] User created, is_completed:", user.is_completed);

      // 온보딩으로 이동
      if (!user.is_completed || result?.needsOnboarding) {
        console.log("[SIGNUP] Navigating to onboarding/terms...");
        setTimeout(() => {
          router.replace("/onboarding/terms");
        }, 100);
      } else {
        console.log("[SIGNUP] Already completed, navigating to home...");
        setTimeout(() => {
          router.replace("/");
        }, 100);
      }

    } catch (e: any) {
      console.error("[SIGNUP] Error:", e);
      setLoading(false);

      const detail = e?.response?.data?.detail || e?.message || "회원가입에 실패했습니다.";
      Alert.alert("회원가입 실패", detail, [
        { text: "확인", onPress: () => setStep("input") }
      ]);
    }
  }, [loginId, email, password, router, setUser, setToken]);

  const onCancelVerification = () => {
    setStep("input");
  };

  if (step === "verify") {
    return (
      <View style={styles.container}>
        <EmailVerification
          email={email}
          purpose="signup"
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>회원가입</Text>

        <View style={styles.formArea}>
          {/* 아이디 입력 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>아이디</Text>
            <View style={styles.checkContainer}>
              <TextInput
                value={loginId}
                onChangeText={(text) => {
                  setLoginId(text);
                  setLoginIdChecked(false);
                  setLoginIdAvailable(false);
                }}
                placeholder="영문, 숫자, _ 사용 가능 6~12자"
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.input, styles.inputWithButton]}
                editable={!loading}
              />
              <Pressable onPress={onCheckLoginId} style={styles.checkBtn} disabled={loading}>
                <Text style={styles.checkBtnText}>중복확인</Text>
              </Pressable>
            </View>
            {loginIdChecked && (
              <Text style={[styles.helperText, loginIdAvailable ? styles.successText : styles.errorText]}>
                {loginIdAvailable ? "✓ 사용 가능한 아이디입니다" : "✗ 이미 사용 중인 아이디입니다"}
              </Text>
            )}
          </View>

          {/* 이메일 입력 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="example@email.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.input}
              editable={!loading}
              returnKeyType="next"
            />
          </View>

          {/* 비밀번호 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>비밀번호</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="영문+숫자+특수문자 6~18자"
                secureTextEntry={!showPassword}
                style={[styles.input, styles.passwordInput]}
                editable={!loading}
                returnKeyType="next"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={Theme.colors.gray}
                />
              </Pressable>
            </View>
          </View>

          {/* 비밀번호 확인 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>비밀번호 확인</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                placeholder="비밀번호를 다시 입력해 주세요"
                secureTextEntry={!showPasswordConfirm}
                style={[styles.input, styles.passwordInput]}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={onNext}
              />
              <Pressable
                onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPasswordConfirm ? "eye-off" : "eye"}
                  size={20}
                  color={Theme.colors.gray}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 영역 */}
      <View style={styles.bottomBtns}>
        <Pressable
          onPress={onNext}
          style={({ pressed }) => [
            styles.nextBtn,
            pressed && { opacity: 0.9 },
            loading && { opacity: 0.6 },
          ]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextBtnText}>다음</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// styles는 기존과 동일
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  title: {
    fontSize: Theme.fontSizes.xl,
    fontWeight: Theme.fontWeights.bold as any,
    color: Theme.colors.black,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  formArea: {
    marginTop: Theme.spacing.sm,
  },
  inputGroup: {
    marginBottom: Theme.spacing.md,
  },
  label: {
    fontSize: Theme.fontSizes.sm,
    fontWeight: Theme.fontWeights.semibold as any,
    color: Theme.colors.black,
    marginBottom: Theme.spacing.xs,
  },
  input: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    paddingHorizontal: 16,
    fontSize: Theme.fontSizes.base,
    backgroundColor: "#fff",
  },
  passwordContainer: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: Theme.spacing.xs,
  },
  eyeBtn: {
    position: "absolute",
    right: Theme.spacing.sm,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.sm,
  },
  bottomBtns: {
    padding: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.lightGray,
    backgroundColor: Theme.colors.white,
  },
  nextBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: Theme.colors.themeOrange,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnText: {
    color: "#fff",
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
  checkContainer: {
    flexDirection: "row",
    gap: 8,
  },
  inputWithButton: {
    flex: 1,
  },
  checkBtn: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.themeOrange,
    borderRadius: 10,
    justifyContent: "center",
  },
  checkBtnText: {
    color: "#fff",
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.semibold as any,
  },
  helperText: {
    fontSize: Theme.fontSizes.sm,
    marginTop: 4,
  },
  successText: {
    color: Theme.colors.themeOrange,
  },
  errorText: {
    color: "#ef4444",
  },
});