// src/state/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      hydrated: false,

      setUser: (u) => {
        console.log("[AUTH STORE] Setting user:", u);
        set({ user: u });
      },
      
      setToken: (t) => {
        console.log("[AUTH STORE] Setting token:", t ? "exists" : "null");
        set({ token: t });
        setAccessToken(t);
      },
      
      setHydrated: (v) => set({ hydrated: v }),

      logout: async () => {
        try {
          console.log("[AUTH STORE] Logging out...");
          
          // 서버 로그아웃 호출
          await logoutApi().catch(() => null);

          // AsyncStorage 삭제
          await AsyncStorage.removeItem("access_token");
          await AsyncStorage.removeItem("refresh_token");

          // http 토큰 제거
          setAccessToken(null);

          // store 상태 초기화
          set({ user: null, token: null });
          
          console.log("[AUTH STORE] Logout complete");
        } catch (e) {
          console.error("[AUTH STORE] Logout error:", e);
          throw e;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // hydrate 시 토큰 복원
      onRehydrateStorage: () => (state) => {
        console.log("[AUTH STORE] Rehydrating...");
        if (state?.token) {
          console.log("[AUTH STORE] Restoring token from storage");
          setAccessToken(state.token);
        }
        if (state) {
          state.setHydrated(true);
          console.log("[AUTH STORE] Rehydration complete, user:", state.user);
        }
      },
    }
  )
);