// utils/auth.ts
import { useAuthStore } from "@/src/state/authStore";
import { Alert } from "react-native";

export const getUserIdFromToken = (token: string): number | null => {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/"); // Base64URL -> Base64
    const decodedJson = JSON.parse(atob(base64));
    // sub 키에서 숫자 ID 반환
    return decodedJson.sub ? Number(decodedJson.sub) : null;
  } catch (err) {
    console.warn("JWT 디코딩 실패", err);
    return null;
  }
};

export function requireLogin(action: () => void) {
  const { user } = useAuthStore.getState();
  if (!user) {
    Alert.alert("로그인 필요", "로그인 후 이용할 수 있어요.");
    return;
  }
  action();
}