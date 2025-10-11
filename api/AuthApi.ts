// api/AuthApi.ts
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import http, { setAccessToken } from "./http";

WebBrowser.maybeCompleteAuthSession?.();

const RETURN_URL = Linking.createURL("auth/callback");


function parseQuery(url: string): Record<string, string> {
  try {
    const u = Linking.parse(url);
    const qp = (u.queryParams || {}) as Record<string, any>;
    const out: Record<string, string> = {};
    Object.keys(qp).forEach((k) => {
      const v = qp[k];
      out[k] = typeof v === "string" ? v : Array.isArray(v) ? String(v[0]) : String(v);
    });
    if (!Object.keys(out).length) {
      const hash = url.split("#")[1] || "";
      if (hash) {
        const hq = Object.fromEntries(new URLSearchParams(hash) as any);
        Object.assign(out, hq);
      }
    }
    if (!Object.keys(out).length) {
      const q = url.split("?")[1] || "";
      if (q) Object.assign(out, Object.fromEntries(new URLSearchParams(q) as any));
    }
    return out;
  } catch {
    const both = url.split("#")[1] || url.split("?")[1] || "";
    return both ? (Object.fromEntries(new URLSearchParams(both) as any) as any) : {};
  }
}

function waitForDeepLinkOnce(timeoutMs = 8000): Promise<string | null> {
  return new Promise((resolve) => {
    let done = false;
    const t = setTimeout(() => {
      if (!done) {
        done = true;
        resolve(null);
      }
    }, timeoutMs);
    const sub = Linking.addEventListener("url", ({ url }) => {
      if (done) return;
      done = true;
      clearTimeout(t);
      sub.remove?.();
      resolve(url);
    });
  });
}

function withTimeout<T>(p: Promise<T>, ms = 60000) {
  return Promise.race<T>([
    p,
    new Promise<T>((_, rej) =>
      setTimeout(
        () =>
          rej(Object.assign(new Error("apple_signin_timeout"), { code: "apple_signin_timeout" })),
        ms
      )
    ),
  ]);
}

export async function loginWithKakaoNative(): Promise<{ access: string; refresh?: string }> {
  const { data } = await http.get<{ loginUrl: string; state?: string }>(
    "/auth/kakao/login",
    { params: { client: "native", returnUrl: RETURN_URL } }
  );
  const loginUrl = data?.loginUrl;
  if (!loginUrl) throw new Error("kakao_login_url_missing");
  console.log("[KAKAO] loginUrl =", loginUrl, " state =", data?.state);
  console.log("[RETURN_URL]", RETURN_URL);

  const result = await WebBrowser.openAuthSessionAsync(loginUrl, RETURN_URL);
  console.log("[AUTH RESULT]", result);

  let urlFromAuth: string | null = result.type === "success" ? result.url : null;
  console.log("[CALLBACK URL]", urlFromAuth);

  if (!urlFromAuth) {
    console.log("[AUTH] waiting deep link…");
    urlFromAuth = await waitForDeepLinkOnce(8000);
    console.log("[AUTH] deep link result:", urlFromAuth);
  }
  if (!urlFromAuth) throw new Error("login_cancelled");

  const q = parseQuery(urlFromAuth);
  if (q.error) throw new Error(q.error_description || q.error);
  console.log("[KAKAO] parsed =", q);

  let access = q.access || q.accessToken || q.jwt || null;
  let refresh = q.refresh || q.refreshToken || null;

  if (!access && q.code) {
    const resp = await http.get("/auth/kakao/callback", {
      params: { code: q.code, state: q.state },
    });
    const body = resp?.data || {};
    access = body.accessToken || body.access || body.token || null;
    refresh = body.refreshToken || body.refresh || null;
    console.log("[KAKAO] exchanged token len =", access?.length || 0);
  }

  if (!access) throw new Error("no_access_token_from_callback");

  setAccessToken(access);
  return { access, refresh: refresh || undefined };
}

export async function emailSignup(email: string, password: string, nickname?: string) {
  const { data } = await http.post("/auth/email/signup", { email, password, nickname });
  const token = data?.accessToken || data?.access;
  if (token) setAccessToken(token);
  return data;
}

export async function emailLogin(email: string, password: string) {
  const { data } = await http.post("/auth/email/login", { email, password });
  const token = data?.accessToken || data?.access;
  if (token) setAccessToken(token);
  return data;
}

export async function loginWithAppleWeb(): Promise<{ access: string; refresh?: string }> {
  const { data } = await http.get<{ loginUrl: string }>(
    "/auth/apple/login",
    { params: { client: "web", returnUrl: RETURN_URL } }
  );

  const result = await WebBrowser.openAuthSessionAsync(data.loginUrl, RETURN_URL);
  let urlFromAuth: string | null = result.type === "success" ? result.url : null;

  if (!urlFromAuth) {
    console.log("[APPLE WEB] waiting deep link…");
    urlFromAuth = await waitForDeepLinkOnce(8000);
  }
  if (!urlFromAuth) throw new Error("login_cancelled");

  const q = parseQuery(urlFromAuth);
  if (q.error) throw new Error(q.error_description || q.error);

  const access = q.access || q.accessToken;
  const refresh = q.refresh || q.refreshToken;
  if (!access) throw new Error("no_access_token_from_callback");

  setAccessToken(access);
  return { access, refresh };
}

export async function loginWithApple(): Promise<{ token: string; user?: any; raw?: any }> {
  if (Platform.OS !== "ios") {
    throw new Error("Apple 로그인은 iOS에서만 지원됩니다.");
  }

  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    const web = await loginWithAppleWeb();
    return { token: web.access, user: null, raw: { via: "web" } };
  }

  try {
    console.log("[APPLE] signInAsync start");
    const cred = await withTimeout(
      AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      }),
      60000
    );

    const idToken = (cred as any)?.identityToken as string | undefined;
    const authCode = cred?.authorizationCode ?? null;
    console.log("[APPLE] idTokenLen=", idToken?.length || 0, "hasAuthCode=", !!authCode);
    if (!idToken) throw Object.assign(new Error("apple_auth_no_id_token"), { code: "apple_auth_no_id_token" });

    const { data } = await http.post("/auth/apple/callback", {
      identityToken: idToken,
      authorizationCode: authCode,
      user: (cred as any).user ?? null,
      email: (cred as any).email ?? null,
      givenName: cred.fullName?.givenName ?? null,
      familyName: cred.fullName?.familyName ?? null,
      mode: "json",
      state: "native:" + Math.random().toString(36).slice(2, 10),
    });

    const token = data?.accessToken || data?.access || data?.token;
    console.log("[APPLE] resp keys:", Object.keys(data || {}), "accessToken len:", token?.length || 0);
    if (!token) throw new Error("no_access_token_from_callback");

    setAccessToken(token);
    return { token, user: data?.user ?? null, raw: data };
  } catch (e: any) {
    const code = e?.code || e?.name;
    if (code === "ERR_REQUEST_CANCELED" || code === "ASAuthorizationErrorCanceled") {
      throw Object.assign(new Error("사용자가 로그인을 취소했어요."), { code: "ASAuthorizationErrorCanceled" });
    }
    if (code === "apple_signin_timeout" || code === "apple_auth_no_id_token") {
      const web = await loginWithAppleWeb();
      setAccessToken(web.access);
      return { token: web.access, user: null, raw: { via: "web" } };
    }
    throw e;
  }
}
