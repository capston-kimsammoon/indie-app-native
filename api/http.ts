// app/api/http.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import config from "./config";
import Constants from "expo-constants";
import { Platform } from "react-native";

export const baseURL = (() => {
  const extra = (Constants?.expoConfig as any)?.extra || {};
  return (
    config?.baseUrl ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    extra.EXPO_PUBLIC_API_BASE_URL ||
    (Platform.OS === "ios" ? "http://192.168.45.167:8000" :
    Platform.OS === "android" ? "http://192.168.45.167:8000" :
    "http://192.168.45.167:8000")
  );
})();

// axios 인스턴스
const http = axios.create({
  baseURL,
  timeout: config?.timeout ?? 15000,
  withCredentials: Platform.OS === "web",
});

// 토큰 상태 관리
let ACCESS_TOKEN: string | null = null;

export function setAccessToken(token: string | null) {
  ACCESS_TOKEN = token;

  if (ACCESS_TOKEN) {
    http.defaults.headers.common.Authorization = `Bearer ${ACCESS_TOKEN}`;
    if (Platform.OS !== "web") {
      (http.defaults.headers.common as any).Cookie = `access_token=${ACCESS_TOKEN}`;
    }
  } else {
    delete http.defaults.headers.common.Authorization;
    delete (http.defaults.headers.common as any).Cookie;
  }
}

export const getAccessToken = () => ACCESS_TOKEN;
export const clearAccessToken = () => setAccessToken(null);

// 요청 인터셉터
http.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  cfg.headers = { ...(cfg.headers || {}), "X-Client": "rn" };
  console.log("HTTP REQ headers:", cfg.headers);
  
  if (ACCESS_TOKEN) {
    cfg.headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
    if (Platform.OS !== "web") {
      cfg.headers.Cookie = `access_token=${ACCESS_TOKEN}`;
    }
  }

  return cfg;
});

// 응답 인터셉터
http.interceptors.response.use(
  (res) => res,
  (err: AxiosError<any>) => {
    const status = err.response?.status;
    const method = (err.config?.method || "GET").toUpperCase();
    const url = err.config?.url || "(unknown)";
    console.error(`[HTTP ${status ?? "ERR"}] ${method} ${url}`, err.response?.data ?? err.message);
    return Promise.reject(err);
  }
);

export default http;
