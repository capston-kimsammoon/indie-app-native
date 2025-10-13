// utils/auth.ts
import { useAuthStore } from "@/src/state/authStore";
import { Alert } from "react-native";
import { decodeJwtPayload } from "./jwt";

export const getUserIdFromToken = (token: string): number | null => {
  const payload = decodeJwtPayload<{ sub?: string | number }>(token);
  if (!payload?.sub) return null;

  const n = typeof payload.sub === "number" ? payload.sub : parseInt(payload.sub, 10);
  return Number.isFinite(n) ? n : null;
};

export function requireLogin(action: () => void): boolean {
  const { user } = useAuthStore.getState();
  if (!user) {
    Alert.alert("로그인 필요", "로그인 후 이용할 수 있어요.");
    return false;
  }
  action();
  return true;
}
