// app/login/index.tsx
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Theme from "@/constants/Theme";
import Constants from "expo-constants";
import { loginWithKakaoNative, emailLogin, loginWithApple } from "@/api/AuthApi";
import { fetchUserInfo } from "@/api/UserApi";
import { useAuthStore } from "@/src/state/authStore";
import * as AppleAuthentication from "expo-apple-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LoadingKey = null | "kakao" | "apple" | "email" | "guest";

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState<LoadingKey>(null);
  const { setUser, setToken } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  const emailDisabled = submitting || loading === "kakao" || loading === "apple";
  const kakaoDisabled = submitting || loading === "email" || loading === "apple";
  const appleDisabled = submitting || loading === "email" || loading === "kakao";

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [autoLogin, setAutoLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const finishLogin = useCallback(async (token: string) => {
    try {
      console.log("[LOGIN] Fetching user info...");
      const me = await fetchUserInfo();
      console.log("[LOGIN] User info:", me);

      if (!me) {
        throw new Error("사용자 정보를 가져올 수 없습니다.");
      }

      // 사용자 정보 저장
      setUser(me);

      // 온보딩 완료 여부 확인
      if (me.is_completed === false) {
        console.log("[LOGIN] Profile incomplete, navigating to onboarding...");
        setTimeout(() => {
          router.replace("/onboarding/terms");
        }, 100);
      } else {
        console.log("[LOGIN] Profile completed, navigating to home...");
        setTimeout(() => {
          router.replace("/");
        }, 100);
      }
    } catch (e: any) {
      console.error("[LOGIN] Finish login error:", e);
      const detail = e?.response?.data?.detail || e?.message || "사용자 정보를 가져올 수 없습니다.";
      Alert.alert("로그인", detail);
    }
  }, [router, setUser]);

  // 이메일 로그인
  const onEmailLogin = async () => {
    if (!loginId.trim() || !password) {
      Alert.alert("로그인", "아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      setLoading("email");
      console.log("[LOGIN] Email login...");

      const result = await emailLogin(loginId.trim(), password);
      console.log("[LOGIN] Login result:", result);

      const token = result?.accessToken || result?.access;
      if (!token) {
        throw new Error("인증 토큰을 받지 못했습니다.");
      }

      // 토큰 저장
      console.log("[LOGIN] Saving token...");
      setToken(token);
      await AsyncStorage.setItem("access_token", token);
      if (result?.refreshToken) {
        await AsyncStorage.setItem("refresh_token", result.refreshToken);
      }

      // 로그인 완료 처리
      await finishLogin(token);

    } catch (e: any) {
      console.error("[LOGIN] Email login error:", e);
      const detail = e?.response?.data?.detail || e?.message || "로그인에 실패했습니다.";
      Alert.alert("로그인 실패", detail);
    } finally {
      setLoading(null);
    }
  };

  // 카카오 로그인
  const onKakao = useCallback(async () => {
    try {
      setLoading("kakao");
      console.log("[KAKAO] Starting login...");

      const { access } = await loginWithKakaoNative();
      console.log("[KAKAO] Login success");

      // 토큰 저장
      setToken(access);
      await AsyncStorage.setItem("access_token", access);

      // 로그인 완료 처리
      await finishLogin(access);

    } catch (e: any) {
      console.error("[KAKAO] Login error:", e);
      Alert.alert("카카오 로그인", e?.message || "로그인에 실패했어요.");
    } finally {
      setLoading(null);
    }
  }, [finishLogin, setToken]);

  // 애플 로그인
  const onApple = useCallback(async () => {
    const bundleId =
      (Constants?.expoConfig as any)?.ios?.bundleIdentifier ??
      (Constants?.expoConfig as any)?.extra?.iosBundleIdentifier ??
      "unknown";
    console.log("[APPLE] bundleId =", bundleId);

    if (Platform.OS !== "ios") {
      Alert.alert("Apple 로그인", "이 기능은 iOS에서만 지원됩니다.");
      return;
    }
    if (submitting || (loading && loading !== "apple")) return;

    try {
      setSubmitting(true);
      setLoading("apple");
      console.log("[APPLE] Starting login...");

      const { token, isNew, firstAppleAuth } = await loginWithApple();
      console.log("[APPLE] Login success, isNew:", isNew, "firstAppleAuth:", firstAppleAuth);

      // 토큰 저장
      setToken(token);
      await AsyncStorage.setItem("access_token", token);

      // 로그인 완료 처리
      await finishLogin(token);

    } catch (e: any) {
      console.error("[APPLE] Login error:", e);
      
      if (e?.code === "apple_signin_timeout") return;
      if (e?.code === "ERR_REQUEST_CANCELED" || e?.code === "ASAuthorizationErrorCanceled") return;
      
      if (e?.code === "apple_auth_no_id_token") {
        Alert.alert(
          "Apple 로그인",
          "identityToken이 비었습니다.\n- Capabilities/프로비저닝/실기기 여부 확인\n- 설정 기록 삭제 후 재시도"
        );
        return;
      }
      
      Alert.alert("Apple 로그인", e?.response?.data?.detail || e?.message || "로그인 실패");
    } finally {
      setLoading(null);
      setSubmitting(false);
    }
  }, [loading, submitting, finishLogin, setToken]);

  const disabled = !!loading || submitting;

  // 페이지 이동 함수들
  const onFindId = () => router.push("/login/find-id");
  const onFindPw = () => router.push("/login/find-password");
  const onSignup = () => router.push("/login/email");

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
          {/* 아이디 */}
          <TextInput
            value={loginId}
            onChangeText={setLoginId}
            placeholder="아이디"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            editable={!disabled}
            returnKeyType="next"
          />
          {/* 비밀번호 */}
          <View style={styles.passwordContainer}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호"
              secureTextEntry={!showPasswordConfirm}
              style={[styles.input, styles.passwordInput]}
              editable={!disabled}
              returnKeyType="done"
              onSubmitEditing={onEmailLogin}
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

          {/* 자동 로그인 체크 */}
          <Pressable
            onPress={() => setAutoLogin((v) => !v)}
            style={styles.autoLoginRow}
            disabled={disabled}
            accessibilityLabel="자동 로그인"
          >
            <Ionicons
              name={autoLogin ? "checkbox" : "square-outline"}
              size={22}
              color={Theme.colors.themeOrange}
            />
            <Text style={styles.autoLoginText}>자동 로그인</Text>
          </Pressable>

          {/* 로그인 버튼 */}
          <Pressable
            onPress={onEmailLogin}
            style={({ pressed }) => [
              styles.loginBtn,
              pressed && { opacity: 0.9 },
              disabled && { opacity: 0.6 },
            ]}
            disabled={disabled}
            accessibilityLabel="로그인"
          >
            <Text style={styles.loginBtnText}>로그인</Text>
            {loading === "email" && <ActivityIndicator color="#fff" style={{ marginLeft: 8 }} />}
          </Pressable>

          {/* 하단 링크 */}
          <View style={styles.linksRow}>
            <TouchableOpacity onPress={onFindId} disabled={disabled}>
              <Text style={styles.linkText}>아이디 찾기</Text>
            </TouchableOpacity>
            <Text style={styles.linkDivider}>|</Text>
            <TouchableOpacity onPress={onFindPw} disabled={disabled}>
              <Text style={styles.linkText}>비밀번호 찾기</Text>
            </TouchableOpacity>
            <Text style={styles.linkDivider}>|</Text>
            <TouchableOpacity onPress={onSignup} disabled={disabled}>
              <Text style={styles.linkText}>회원가입</Text>
            </TouchableOpacity>
          </View>

          {/* 소셜 버튼들 */}
          <View style={styles.socialRow}>
            <Pressable
              onPress={onKakao}
              disabled={kakaoDisabled || disabled}
              style={({ pressed }) => [styles.circleBtn, styles.kakaoCircle, pressed && { opacity: 0.85 }]}
              accessibilityLabel="카카오로 로그인"
            >
              <Ionicons name="chatbubble" size={20} color="#181600" />
              {loading === "kakao" && <ActivityIndicator style={styles.circleSpinner} />}
            </Pressable>

            {Platform.OS === "ios" && (
              <Pressable
                onPress={onApple}
                disabled={appleDisabled || disabled}
                style={({ pressed }) => [styles.circleBtn, styles.appleCircle, pressed && { opacity: 0.9 }]}
                accessibilityLabel="Apple로 로그인"
              >
                <Ionicons name="logo-apple" size={22} color="#fff" />
                {loading === "apple" && <ActivityIndicator color="#fff" style={styles.circleSpinner} />}
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 영역 */}
      <View style={styles.bottomBtns}>
        <Pressable
          style={({ pressed }) => pressed && { opacity: 0.7 }}
          onPress={() => router.push("/notice")}
        >
          <Text style={styles.bottomBtnText}>공지사항</Text>
        </Pressable>
        <Text style={styles.verticalDivider}>|</Text>
        <Pressable
          style={({ pressed }) => pressed && { opacity: 0.7 }}
          onPress={() => router.push("/support")}
        >
          <Text style={styles.bottomBtnText}>고객센터</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const BTN_H = 52;
const RADIUS = 54;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xl,
  },
  formArea: {
    width: "100%",
    marginTop: Theme.spacing.xl,
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    fontSize: Theme.fontSizes.base,
    backgroundColor: "#fff",
  },
  passwordInput: {
    paddingRight: Theme.spacing.xs,
  },
  autoLoginRow: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
    gap: 4,
  },
  autoLoginText: {
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.black,
    fontWeight: Theme.fontWeights.regular
  },
  loginBtn: {
    height: BTN_H,
    borderRadius: 12,
    backgroundColor: Theme.colors.themeOrange,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
  },
  loginBtnText: {
    color: "#fff",
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.semibold as any,
  },
  linksRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginVertical: Theme.spacing.lg,
  },
  linkText: {
    color: Theme.colors.gray,
    fontSize: Theme.fontSizes.sm
  },
  linkDivider: {
    color: Theme.colors.lightGray,
    fontSize: Theme.fontSizes.sm
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: Theme.spacing.sm,
  },
  circleBtn: {
    width: RADIUS,
    height: RADIUS,
    borderRadius: RADIUS / 2,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  circleSpinner: {
    position: "absolute",
    right: -4,
    bottom: -4,
  },
  kakaoCircle: { backgroundColor: "#FEE500" },
  appleCircle: { backgroundColor: "#000" },
  bottomBtns: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
  },
  bottomBtnText: {
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.darkGray,
    fontWeight: Theme.fontWeights.regular,
  },
  verticalDivider: {
    color: Theme.colors.lightGray,
    textAlign: "center",
  },
  passwordContainer: {
    position: "relative",
    justifyContent: "center",
  },
  eyeBtn: {
    position: "absolute",
    right: Theme.spacing.sm,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.sm,
  },
});