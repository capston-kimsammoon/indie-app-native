// app/http.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

/** baseURL 결정 */
const extra = (Constants?.expoConfig && (Constants.expoConfig as any).extra) || {};
function resolveBaseUrl() {
  return (
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    extra?.EXPO_PUBLIC_API_BASE_URL ||
    (Platform.OS === "ios"
      ? "http://localhost:8000"
      : Platform.OS === "android"
      ? "http://10.0.2.2:8000"
      : "http://localhost:8000")
  );
}
export const baseURL = resolveBaseUrl();

/** 토큰 모듈 상태 */
let ACCESS_TOKEN: string | null = null;

const http = axios.create({
  baseURL,
  timeout: 15_000,
  withCredentials: Platform.OS === "web", // 웹에서만 자동 쿠키 포함
});

/** 토큰 세터: defaults + 메모리 모두 갱신 */
export function setAccessToken(t: string | null) {
  ACCESS_TOKEN = t || null;

  if (ACCESS_TOKEN) {
    http.defaults.headers.common.Authorization = `Bearer ${ACCESS_TOKEN}`;
    if (Platform.OS !== "web") {
      // 네이티브는 쿠키 자동 저장이 안 되므로 헤더로 직접 부착
      (http.defaults.headers.common as any).Cookie = `access_token=${ACCESS_TOKEN}`;
    } else {
      delete (http.defaults.headers.common as any).Cookie;
    }
  } else {
    delete http.defaults.headers.common.Authorization;
    delete (http.defaults.headers.common as any).Cookie;
  }
}
export const getAccessToken = () => ACCESS_TOKEN;
export const clearAccessToken = () => setAccessToken(null);

/** 요청 인터셉터: 헤더/쿠키 부착 + 디버그 로그 */
http.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  const headers = (cfg.headers = { ...(cfg.headers as any) } as any);
  headers["X-Client"] = "rn";

  if (ACCESS_TOKEN) {
    headers["Authorization"] = `Bearer ${ACCESS_TOKEN}`;
    if (Platform.OS !== "web") {
      headers["Cookie"] = `access_token=${ACCESS_TOKEN}`;
    }
  }

  // 디버그: 토큰/쿠키 실제 부착 여부
  try {
    const hasAuth = !!headers["Authorization"];
    const hasCookie = !!headers["Cookie"];
    // eslint-disable-next-line no-console
    console.log(
      `[HTTP REQ] ${String(cfg.method || "GET").toUpperCase()} ${cfg.baseURL}${cfg.url}`,
      { hasAuth, hasCookie }
    );
  } catch {}

  return cfg;
});

/** 응답 인터셉터: 에러 로깅 */
http.interceptors.response.use(
  (res) => res,
  (err: AxiosError<any>) => {
    const status = err.response?.status;
    const method = (err.config?.method || "GET").toUpperCase();
    const url = err.config?.url || "(unknown)";
    const body = err.response?.data ?? err.message;
    // eslint-disable-next-line no-console
    console.error(`[HTTP ${status ?? "ERR"}] ${method} ${url}`, body);
    return Promise.reject(err);
  }
);

export default http;
