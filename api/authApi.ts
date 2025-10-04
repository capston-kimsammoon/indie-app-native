// api/AuthApi.ts
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import http, { setAccessToken, getAccessToken } from "./http";

// 앱 스킴과 콜백 경로
const NATIVE_CALLBACK = "indieapp://auth/callback";

// URL 쿼리 파싱
function parseQuery(url: string): Record<string, string> {
  try {
    const u = Linking.parse(url);
    const qp = (u.queryParams || {}) as Record<string, any>;
    const out: Record<string, string> = {};
    Object.keys(qp).forEach((k) => {
      const v = qp[k];
      out[k] = typeof v === "string" ? v : Array.isArray(v) ? String(v[0]) : String(v);
    });
    return out;
  } catch {
    const q = url.split("?")[1] || "";
    return Object.fromEntries(new URLSearchParams(q) as any);
  }
}

// deep link fallback
function waitForDeepLinkOnce(timeoutMs = 5000): Promise<string | null> {
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

/** 네이티브 카카오 로그인 */
export async function loginWithKakaoNative(): Promise<{ access: string; refresh?: string }> {

  // 1) 백엔드에서 로그인 URL 받아오기
  const { data } = await http.get<{ loginUrl: string; state?: string }>("/auth/kakao/login", {
    params: { client: "native" }, // native 모드
  });


  // 2) WebBrowser로 로그인
  const result = await WebBrowser.openAuthSessionAsync(data.loginUrl, NATIVE_CALLBACK);

  let urlFromAuth: string | null = result.type === "success" ? result.url : null;

  // fallback: deep link 기다리기
  if (!urlFromAuth) {
    urlFromAuth = await waitForDeepLinkOnce(5000);
  }

  if (!urlFromAuth) {
    console.error("[AUTH] no callback URL received");
    throw new Error("login_cancelled");
  }

  // 3) 쿼리 파싱
  const q = parseQuery(urlFromAuth);

  if (q.error) {
    console.error("[AUTH] error in callback", q.error, q.error_description);
    throw new Error(q.error_description || q.error);
  }

  // 4) access/refresh 토큰 확인
  const access = q.access || q.accessToken;
  const refresh = q.refresh || q.refreshToken;
  if (!access) {
    console.error("[AUTH] no access token in callback query");
    throw new Error("no_access_token_from_callback");
  }

  // 5) Axios에 토큰 세팅
  setAccessToken(access);

  return { access, refresh };
}

 
// 회원 탈퇴 
export async function withdrawUser() {
  try {
    const res = await http.delete("/auth/withdraw");
    return res.data;
  } catch (error: any) {
    console.error("[AuthApi] withdrawUser error:", error.response?.data || error.message);
    throw error;
  }
}