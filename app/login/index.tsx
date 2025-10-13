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
import { loginWithKakaoNative, emailLogin } from "@/api/AuthApi";
import { fetchUserInfo } from "@/api/UserApi";
import { useAuthStore } from "@/src/state/authStore";
import * as AppleAuthentication from "expo-apple-authentication";
import http, { setAccessToken } from "@/api/http";
import { InteractionManager } from "react-native";

type LoadingKey = null | "kakao" | "apple" | "email" | "guest";

const withTimeout = <T,>(p: Promise<T>, ms = 15000) =>
  Promise.race<T>([
    p,
    new Promise<T>((_, rej) =>
      setTimeout(
        () =>
          rej(
            Object.assign(new Error("apple_signin_timeout"), {
              code: "apple_signin_timeout",
            })
          ),
        ms
      )
    ),
  ]);

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
      setUser(me);
      router.replace("/");
      console.log("[ME] OK", me?.id, me?.email);
      return;
    } catch (e: any) {
      const s = e?._status;
      if (s === 428 || s === 409) {
        Alert.alert("회원가입", "가입이 완료되지 않았습니다. 추가 정보를 입력해 주세요.");
        router.replace("/signup/complete");
        return;
      }
    }

    await new Promise((r) => setTimeout(r, 400));
    try {
      const me = await fetchUserInfo();
      if (!me) throw new Error("no_me_retry");
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
      await finishLoginStrict();
    } catch (e: any) {
      Alert.alert("로그인 실패", e?.response?.data?.detail || e?.message || "로그인 실패");
    } finally {
      setLoading(null);
    }
  }, [loginId, password, finishLoginStrict, submitting]);

  const onKakao = useCallback(async () => {
    try {
      setLoading("kakao");
      const { access } = await loginWithKakaoNative();
      useAuthStore.getState().setToken?.(access);
      await finishLoginStrict();
    } catch (e: any) {
      Alert.alert("카카오 로그인", e?.message || "로그인에 실패했어요.");
    } finally {
      setLoading(null);
    }
  }, [finishLoginStrict]);

  const SSO_TIMEOUT_MS = 60000;
  const nextTick = () => new Promise((r) => requestAnimationFrame(() => r(null)));

  const onApple = useCallback(async () => {
    const bundleId =
      (Constants?.expoConfig as any)?.ios?.bundleIdentifier ??
      (Constants?.expoConfig as any)?.extra?.iosBundleIdentifier ??
      "unknown";
    console.log("[APPLE] bundleId =", bundleId);
    console.log("[APPLE] onApple pressed, loading=", loading, "submitting=", submitting);

    if (Platform.OS !== "ios") {
      console.log("[APPLE] GUARD non-iOS");
      Alert.alert("Apple 로그인", "이 기능은 iOS에서만 지원됩니다.");
      return;
    }
    if (submitting) {
      console.log("[APPLE] GUARD submitting=true → return");
      return;
    }
    if (loading && loading !== "apple") {
      console.log("[APPLE] GUARD loading=", loading, " → return");
      return;
    }

    try {
      setSubmitting(true);
      setLoading("apple");

      const available = await AppleAuthentication.isAvailableAsync();
      console.log("[APPLE] available?", available, "| bundleId =", bundleId);
      if (!available) {
        Alert.alert("Apple 로그인", "이 빌드에서는 Apple 로그인을 쓸 수 없어요(Dev Client/권한 확인).");
        return;
      }

      console.log("[APPLE] WAIT nextTick");
      await nextTick();
      console.log("[APPLE] WAIT interactions");
      await InteractionManager.runAfterInteractions(() => Promise.resolve());

      console.log("[APPLE] BEFORE signInAsync (about to call)");
      const startedAt = Date.now();

      const cred = await withTimeout(
        AppleAuthentication.signInAsync({ requestedScopes: [] }),
        60000
      );
      console.log("AFTER signInAsync(empty scopes)", cred);

      console.log("[APPLE] AFTER signInAsync in", Date.now() - startedAt, "ms");
      const idToken = (cred as any)?.identityToken as string | undefined;
      const authCode = cred?.authorizationCode ?? null;

      console.log(
        "[APPLE] cred summary:",
        JSON.stringify(
          {
            hasIdToken: !!idToken,
            idTokenLen: idToken?.length || 0,
            hasAuthCode: !!authCode,
            email: (cred as any)?.email ?? null,
            givenName: cred?.fullName?.givenName ?? null,
            familyName: cred?.fullName?.familyName ?? null,
            user: (cred as any)?.user ?? null,
          },
          null,
          2
        )
      );

      if (!idToken) {
        throw Object.assign(new Error("apple_auth_no_id_token"), { code: "apple_auth_no_id_token" });
      }

      console.log("[APPLE] POST /auth/apple/callback");
      const resp = await http.post("/auth/apple/callback", {
        identityToken: idToken,
        authorizationCode: authCode,
        user: (cred as any).user ?? null,
        email: (cred as any).email ?? null,
        givenName: cred.fullName?.givenName ?? null,
        familyName: cred.fullName?.familyName ?? null,
        mode: "json",
        state: "native:" + Math.random().toString(36).slice(2, 10),
      });
      const data = resp?.data || {};
      const token = data?.accessToken || data?.access || data?.token;
      console.log("[APPLE] callback ok, tokenLen=", token?.length || 0);
      if (!token) throw new Error("no_access_token_from_callback");

      setAccessToken(token);
      useAuthStore.getState().setToken?.(token);
      await finishLoginStrict();
    } catch (e: any) {
      console.log("[APPLE] ERROR", e?.code || e?.name, e?.message, e);
      if (e?.code === "apple_signin_timeout") {
        Alert.alert(
          "Apple 로그인",
          [
            "로그인 창이 뜨지 않았습니다.",
            "1) 설정 > Apple ID > 'Apple ID를 사용하는 앱'에서 이 앱 삭제",
            "2) 기기 재부팅 후 재시도",
            "3) Dev Client를 usesAppleSignIn: true로 클린 재빌드",
          ].join("\n")
        );
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
      console.log("[APPLE] finally");
    }
  }, [loading, submitting, finishLoginStrict]);

  const disabled = !!loading || submitting;

  // 페이지 이동 함수들 수정
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
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="영문+숫자+특수문자 6~18자"
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

      {/* 하단 버튼 영역 - 고정 */}
      <View style={styles.bottomBtns}>
        <Pressable
          style={({ pressed }) => pressed && { opacity: 0.7 }}
          onPress={() => router.push("notice")}
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
});