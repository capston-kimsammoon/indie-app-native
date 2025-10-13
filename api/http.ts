// app/api/http.ts
import axios, { AxiosError, InternalAxiosRequestConfig,AxiosHeaders } from "axios";
import config from "./config";
import Constants from "expo-constants";
import { Platform } from "react-native";

export const baseURL = (() => {
  const extra = (Constants?.expoConfig as any)?.extra || {};
  return (
    config?.baseUrl ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    extra.EXPO_PUBLIC_API_BASE_URL ||
    (Platform.OS === "ios" ? "http://192.168.35.53:8000" :
    Platform.OS === "android" ? "http://192.168.35.53:8000" :
    "http://192.168.35.53:8000")
  );
})();

const http = axios.create({
  baseURL,
  timeout: config?.timeout ?? 15000,
  withCredentials: Platform.OS === "web",
});

let ACCESS_TOKEN: string | null = null;

export function setAccessToken(token: string | null) {
  ACCESS_TOKEN = token;
  if (ACCESS_TOKEN) {
    http.defaults.headers.common.Authorization = `Bearer ${ACCESS_TOKEN}`;
    delete (http.defaults.headers.common as any).Cookie;
  } else {
    delete http.defaults.headers.common.Authorization;
    delete (http.defaults.headers.common as any).Cookie;
  }
}

http.interceptors.request.use((cfg) => {
  const h = AxiosHeaders.from(cfg.headers || {});
  h.set("X-Client", "rn");
  if (ACCESS_TOKEN) {
    h.set("Authorization", `Bearer ${ACCESS_TOKEN}`);
    if (Platform.OS !== "web") h.delete?.("Cookie");
  }
  cfg.headers = h;
  console.log("HTTP REQ headers:", h);
  console.log("[REQ]", cfg.method?.toUpperCase(), cfg.url, "Authorization=", h.get("Authorization"));
  return cfg;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;

    const fullUrl = String(err.config?.url || "");
    const path = fullUrl.replace(baseURL, "");
    const silent401 = ["/user/me", "/auth/refresh", "/auth/logout"];

    if (status === 401 && silent401.includes(path)) {
      return Promise.reject(Object.assign(err, { _silent: true }));
    }

    if (path === "/user/me" && (err.config?.method || "").toUpperCase() === "PATCH") return Promise.reject(Object.assign(err, { _silent: true }));

    if (status === 428 && path === "/auth/apple/callback") {
      return Promise.reject(Object.assign(err, { _silent: true, code: "SIGNUP_REQUIRED" }));
    }
    if (path === "/user/me" && (err.config?.method || "").toUpperCase() === "GET") {
        return Promise.reject(Object.assign(err, { _silent: true, code: "COMPLETE_REQUIRED" }));
      }
    const method = (err.config?.method || "GET").toUpperCase();
    const detail = err.response?.data?.detail || err.message;
    console.error(`[HTTP ${status ?? "ERR"}] ${method} ${path} - ${detail}`);
    return Promise.reject(err);
  }
);


export const getAccessToken = () => ACCESS_TOKEN;
export const clearAccessToken = () => setAccessToken(null);
export default http;
