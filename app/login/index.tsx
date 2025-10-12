// app/login/index.tsx
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Theme from "@/constants/Theme";
import {
  loginWithKakaoNative,
} from "@/api/AuthApi";
import { fetchUserInfo } from "@/api/UserApi";
import { useAuthStore } from "@/src/state/authStore";

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState<null | "kakao" | "guest">(null);
  const setUser = useAuthStore((s) => s.setUser);

  const onKakao = useCallback(async () => {
    try {
      setLoading("kakao");
      if (Platform.OS === "web") {
        // 웹은 리다이렉트 방식 (페이지 이동)
        // await loginWithKakaoWebRedirect();
        return; // 페이지 이동함
      }

      // 네이티브: 인앱브라우저 → 서버 콜백 → 앱 스킴 복귀
      await loginWithKakaoNative();

      // 토큰 세팅 이후 사용자 정보 확인
      const me = await fetchUserInfo().catch(() => null);
      if (!me) {
        Alert.alert("로그인 실패", "사용자 정보를 가져오지 못했어요.");
        return; // 실패 시 조기 종료
      }

      setUser(me);       // 전역 스토어 갱신
      router.replace("/"); // 홈 등 원하는 곳으로
    } catch (e: any) {
      const msg = e?.message || "로그인에 실패했어요.";
      Alert.alert("카카오 로그인", msg);
    } finally {
      setLoading(null);
    }
  }, [router, setUser]);

  const onGuest = useCallback(() => {
    setLoading("guest");
    router.replace("/");
    setLoading(null);
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.loginContainer}>
        <View style={styles.header}>
          <Ionicons name="musical-notes" size={42} color={Theme.colors.themeOrange} />
          <Text style={styles.title}>modie</Text>
          <Text style={styles.subtitle}>로그인하고 더 많은 기능을 이용해 보세요</Text>
        </View>

        <View style={{ height: 24 }} />

        {/* 카카오 로그인 버튼 */}
        <Pressable
          onPress={onKakao}
          style={({ pressed }) => [styles.kakaoBtn, pressed && { opacity: 0.8 }]}
          disabled={loading !== null}
          accessibilityLabel="카카오로 로그인"
        >
          
          <Text style={styles.kakaoText}>카카오로 계속하기</Text>
          {loading === "kakao" && <ActivityIndicator style={{ marginLeft: 8 }} />}
        </Pressable>

        {/* 구분선 */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>또는</Text>
          <View style={styles.divider} />
        </View>

        {/* 게스트로 둘러보기(선택) */}
        <Pressable
          onPress={onGuest}
          style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.7 }]}
          disabled={loading !== null}
        >
          <Text style={styles.ghostText}>로그인 없이 둘러보기</Text>
          {loading === "guest" && <ActivityIndicator style={{ marginLeft: 8 }} />}
        </Pressable>
      </View>

      <View style={styles.bottomBtns}>
        <Pressable
          style={({ pressed }) => pressed && { opacity: 0.7 }}
          onPress={() => router.push("notice")}
        >
          <Text style={styles.bottomBtnText}>공지사항</Text>
        </Pressable>
        <Text style={styles.verticalDivider}>|</Text>
        <Pressable
          style={({ pressed }) =>pressed && { opacity: 0.7 }}
          onPress={() => router.push("/support")}
        >
          <Text style={styles.bottomBtnText}>고객센터</Text>
        </Pressable>
      </View>
    </View>
  );
}

const BTN_H = 52;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: Theme.spacing.lg,
  },
  header: { alignItems: "center", },
  title: {
    fontSize: 28,
    marginVertical: Theme.spacing.md,
    fontWeight: Theme.fontWeights.bold as any,
    color: Theme.colors.black as any,
  },
  subtitle: {
    marginBottom: Theme.spacing.md,
    color: Theme.colors.darkGray as any,
    fontSize: Theme.fontSizes.sm,
    textAlign: "center",
  },
  kakaoBtn: {
    height: BTN_H,
    borderRadius: 12,
    backgroundColor: "#FEE500",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Theme.spacing.md,
    alignSelf: "stretch",
  },
  kakaoText: {
    color: "#181600",
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.semibold as any,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Theme.colors.lightGray as any,
  },
  dividerText: { color: Theme.colors.gray as any, fontSize: Theme.fontSizes.xs },
  ghostBtn: {
    height: BTN_H,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray as any,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
  },
  ghostText: {
    color: Theme.colors.black as any,
    fontSize: Theme.fontSizes.base,
  },
  bottomBtns: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  bottomBtnText: {
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.black,
    fontWeight: Theme.fontWeights.regular,
  },
  verticalDivider: {
    color: Theme.colors.lightGray,
    textAlign: "center",
  },
});
