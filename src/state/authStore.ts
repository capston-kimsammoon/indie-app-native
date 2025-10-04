import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "@/types/user";
import { setAccessToken } from "@/api/http";
import { logoutApi } from "@/api/UserApi";

type AuthState = {
  user: User | null;
  token: string | null;
  setUser: (u: User | null) => void;
  setToken: (t: string | null) => void;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  hydrated: false,

  setUser: (u) => set({ user: u }),
  setToken: (t) => {
    set({ token: t });
    import('@/api/http').then((mod) => mod.setAccessToken(t));
  },
  setHydrated: (v) => set({ hydrated: v }),

  logout: async () => {
    try {
      // 서버 로그아웃 호출 (선택)
      await logoutApi().catch(() => null);

      // AsyncStorage 삭제
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("refresh_token");

      // http 토큰 제거
      setAccessToken(null);

      // store 상태 초기화
      set({ user: null, token: null });
    } catch (e) {
      console.error("logout error", e);
      throw e;
    }
  },
}));
