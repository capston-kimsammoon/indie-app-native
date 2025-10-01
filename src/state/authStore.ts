// src/state/authStore.ts
import { create } from "zustand";
import type { User } from "@/api/userApi";

type AuthState = {
  user: User | null;
  setUser: (u: User | null) => void;
  hydrated: boolean;          // 초기 로딩 여부
  setHydrated: (v: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
  hydrated: false,
  setHydrated: (v) => set({ hydrated: v }),
}));
