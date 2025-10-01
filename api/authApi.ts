// src/api/authApi.ts
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { Platform } from "react-native";
import { makeRedirectUri } from "expo-auth-session";
import http, { setAccessToken, getAccessToken } from "./http";

const NATIVE_CALLBACK = makeRedirectUri({
  scheme: "indieapp",
  path: "auth/callback",
  preferLocalhost: true,
});

function parseQuery(url: string): Record<string, string> {
  try {
    const u = Linking.parse(url);
    const qp = (u.queryParams || {}) as Record<string, any>;
    const out: Record<string, string> = {};
    Object.keys(qp).forEach((k) => {
      const v = (qp as any)[k];
      out[k] = typeof v === "string" ? v : Array.isArray(v) ? String(v[0]) : String(v);
    });
    return out;
  } catch {
    const q = url.split("?")[1] || "";
    return Object.fromEntries(new URLSearchParams(q) as any);
  }
}

function waitForDeepLinkOnce(timeoutMs = 4000): Promise<string | null> {
  return new Promise((resolve) => {
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      resolve(null);
    }, timeoutMs);

    const sub = Linking.addEventListener("url", ({ url }) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      sub.remove?.();
      resolve(url);
    });
  });
}

/** 1) 네이티브 카카오 로그인 */
export async function loginWithKakaoNative(): Promise<{ access?: string; refresh?: string }> {
  const { data } = await http.get<{ loginUrl: string; state?: string }>("/auth/kakao/login", {
    params: { client: "native" },
  });
  const loginUrl = data.loginUrl;

  console.log("[AUTH] start", { loginUrl, NATIVE_CALLBACK });

  const result = await WebBrowser.openAuthSessionAsync(loginUrl, NATIVE_CALLBACK);
  console.log("[AUTH] webbrowser result", result);

  let urlFromAuth = result.type === "success" ? result.url : null;
  if (!urlFromAuth) {
    const waited = await waitForDeepLinkOnce(5000);
    if (waited) urlFromAuth = waited;
  }
  if (!urlFromAuth) throw new Error("login_cancelled");

  const q = parseQuery(urlFromAuth);
  console.log("[AUTH] callback query", q);

  if (q.error) throw new Error(q.error_description || q.error);

  const access = q.access || q.accessToken;
  const refresh = q.refresh || q.refreshToken;
  if (!access) throw new Error("no_access_token_from_callback");

  setAccessToken(access); // http 기본헤더/인터셉터에 토큰 세팅
  return { access, refresh };
}

/** 2) 웹: 카카오로 리다이렉트 */
export async function loginWithKakaoWebRedirect(): Promise<void> {
  if (Platform.OS !== "web") throw new Error("web only");
  const { data } = await http.get<{ loginUrl: string }>("/auth/kakao/login", {
    params: { client: "web" },
  });
  window.location.href = data.loginUrl;
}

/** 3) 내 정보 */
export async function fetchMe<T = any>(): Promise<T> {
  const { data } = await http.get<T>("/user/me");
  return data;
}

/** 4) 로그아웃 */
export async function logout(): Promise<void> {
  try {
    await http.post("/auth/logout");
  } finally {
    setAccessToken(null);
  }
}

/** 5) 토큰 유틸 */
export function hasToken(): boolean {
  return !!getAccessToken();
}
