// app/login/index.tsx
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
  Alert,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Theme from "@/constants/Theme";
import Constants from "expo-constants";
import { loginWithKakaoNative, emailLogin, loginWithApple } from "@/api/AuthApi";
import { fetchUserInfo } from "@/api/UserApi";
import { useAuthStore } from "@/src/state/authStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LoadingKey = null | "kakao" | "apple" | "email" | "guest";
const TERMS_KEY = "terms_agreed_local";

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState<LoadingKey>(null);
  const setUser = useAuthStore((s) => s.setUser);
  const [submitting, setSubmitting] = useState(false);

  const emailDisabled = submitting || loading === "kakao" || loading === "apple";
  const kakaoDisabled = submitting || loading === "email" || loading === "apple";
  const appleDisabled = submitting || loading === "email" || loading === "kakao";

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [autoLogin, setAutoLogin] = useState(true);

  const finishLoginStrict = useCallback(async () => {
    const tryOnce = async () => {
      const me = await fetchUserInfo().catch((e: any) => {
        (e as any)._status = e?.status || e?.response?.status;
        throw e;
      });
      if (!me) throw Object.assign(new Error("no_me"), { _status: 0 });
      return me;
    };

    try {
      const me = await tryOnce();

      const termsLocal = await AsyncStorage.getItem(TERMS_KEY);
      const needs = (me as any)?.needs || {};
      const nickname = (me as any)?.nickname ?? null;

      if (needs.terms || !termsLocal) {
        console.log("[ONBOARD] route -> /onboarding/terms (local)");
        router.replace("/onboarding/terms");
        return;
      }
      if (needs.profile || !nickname) {
        console.log("[ONBOARD] route -> /onboarding/profile");
        router.replace("/onboarding/profile");
        return;
      }

      setUser(me);
      router.replace("/");
      console.log("[ME] OK", me?.id, me?.email);
      return;
    } catch (e: any) {
      const s = e?._status;
      if (s === 428 || s === 409) {
        const needs = e?.response?.data?.needs || {};
        router.replace(needs.terms ? "/onboarding/terms" : "/onboarding/profile");
        return;
      }
    }

    await new Promise((r) => setTimeout(r, 400));
    try {
      const me = await fetchUserInfo();
      if (!me) throw new Error("no_me_retry");

      const termsLocal = await AsyncStorage.getItem(TERMS_KEY);
      const needs2 = (me as any)?.needs || {};
      const nickname2 = (me as any)?.nickname ?? null;

      if (needs2.terms || !termsLocal) {
        console.log("[ONBOARD] (retry) route -> /onboarding/terms");
        router.replace("/onboarding/terms");
        return;
      }
      if (needs2.profile || !nickname2) {
        console.log("[ONBOARD] (retry) route -> /onboarding/profile");
        router.replace("/onboarding/profile");
        return;
      }

      setUser(me);
      router.replace("/");
      console.log("[ME] OK after retry", me?.id, me?.email);
    } catch (e: any) {
      const s = e?.response?.status;
      const detail = e?.response?.data?.detail || e?.message || "사용자 정보를 가져오지 못했어요.";
      console.log("[ME] FAIL after retry", s, detail);
      if (s === 401 || s === 403) {
        Alert.alert("로그인", "세션이 유효하지 않습니다. 다시 시도해 주세요.");
      } else {
        Alert.alert("로그인", detail);
      }
    }
  }, [router, setUser]);

  const onEmailLogin = useCallback(async () => {
    if (submitting) return;
    try {
      if (!loginId.trim() || !password.trim()) {
        Alert.alert("로그인", "아이디/비밀번호를 입력해 주세요.");
        return;
      }
      setLoading("email");
      await emailLogin(loginId.trim(), password.trim());

      await AsyncStorage.removeItem(TERMS_KEY);

      const me = await fetchUserInfo().catch(() => null);
      if (me?.nickname) {
        await AsyncStorage.setItem(TERMS_KEY, "1");
        await finishLoginStrict();
      } else {
        router.replace("/onboarding/terms");
      }
    } catch (e: any) {
      Alert.alert("이메일 로그인", e?.response?.data?.detail || e?.message || "로그인 실패");
    } finally {
      setLoading(null);
    }
  }, [loginId, password, finishLoginStrict, submitting]);

  const onKakao = useCallback(async () => {
    try {
      setLoading("kakao");
      const { access } = await loginWithKakaoNative();
      useAuthStore.getState().setToken?.(access);

      await AsyncStorage.removeItem(TERMS_KEY);

      const me = await fetchUserInfo().catch(() => null);
      if (me?.nickname) {
        await AsyncStorage.setItem(TERMS_KEY, "1");
        await finishLoginStrict();
      } else {
        router.replace("/onboarding/terms");
      }
    } catch (e: any) {
      Alert.alert("카카오 로그인", e?.message || "로그인에 실패했어요.");
    } finally {
      setLoading(null);
    }
  }, [finishLoginStrict]);

  const onApple = useCallback(async () => {
    const bundleId =
      (Constants?.expoConfig as any)?.ios?.bundleIdentifier ??
      (Constants?.expoConfig as any)?.extra?.iosBundleIdentifier ??
      "unknown";
    console.log("[APPLE] bundleId =", bundleId);
    console.log("[APPLE] onApple pressed, loading=", loading, "submitting=", submitting);

    if (Platform.OS !== "ios") {
      Alert.alert("Apple 로그인", "이 기능은 iOS에서만 지원됩니다.");
      return;
    }
    if (submitting) return;
    if (loading && loading !== "apple") return;

    try {
      setSubmitting(true);
      setLoading("apple");

      const { token, isNew, needs, firstAppleAuth } = await loginWithApple();
      useAuthStore.getState().setToken?.(token);

      await AsyncStorage.removeItem(TERMS_KEY);

      const me = await fetchUserInfo().catch(() => null);
   if (firstAppleAuth || isNew || !me?.nickname) {
     console.log("[ONBOARD] apple first/new -> terms");
     router.replace("/onboarding/terms");
     return;
   }

      if (me?.nickname) {
        await AsyncStorage.setItem(TERMS_KEY, "1");
        await finishLoginStrict();
      } else {
        router.replace("/onboarding/terms");
      }
    } catch (e: any) {
      console.log("[APPLE] ERROR", e?.code || e?.name, e?.message, e);
      if (e?.code === "apple_signin_timeout") {
        return;
      }
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
      console.log("[APPLE] finally]");
    }
  }, [loading, submitting, finishLoginStrict, router]);

  const disabled = !!loading || submitting;

  const onFindId = () => Alert.alert("아이디 찾기", "서비스 준비 중입니다.");
  const onFindPw = () => Alert.alert("비밀번호 찾기", "서비스 준비 중입니다.");
  const onSignup = () => router.push("/login/email");

  return (
    <View style={styles.container}>
      <View style={styles.formArea}>
        {/* 아이디 */}
        <TextInput
          value={loginId}
          onChangeText={setLoginId}
          placeholder="모디 아이디 6~12자"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          style={styles.input}
          editable={!disabled}
          returnKeyType="next"
        />
        {/* 비밀번호 */}
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="영문+숫자+특수문자 6~12자"
          secureTextEntry
          style={styles.input}
          editable={!disabled}
          returnKeyType="done"
          onSubmitEditing={onEmailLogin}
        />

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
            color={Theme.colors.black}
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
          <Pressable onPress={onFindId} disabled={disabled}>
            <Text style={styles.linkText}>아이디 찾기</Text>
          </Pressable>
          <Text style={styles.linkDivider}>|</Text>
          <Pressable onPress={onFindPw} disabled={disabled}>
            <Text style={styles.linkText}>비밀번호 찾기</Text>
          </Pressable>
          <Text style={styles.linkDivider}>|</Text>
          <Pressable onPress={onSignup} disabled={disabled}>
            <Text style={styles.linkText}>회원가입</Text>
          </Pressable>
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
    </View>
  );
}

const BTN_H = 52;
const RADIUS = 54;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
  },
  formArea: { marginTop: Theme.spacing.xl },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: Theme.fontSizes.base,
    backgroundColor: "#fff",
  },
  autoLoginRow: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  autoLoginText: { fontSize: Theme.fontSizes.sm, color: Theme.colors.black },
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
  linkText: { color: Theme.colors.gray, fontSize: Theme.fontSizes.sm },
  linkDivider: { color: Theme.colors.lightGray, fontSize: Theme.fontSizes.sm },
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
});
