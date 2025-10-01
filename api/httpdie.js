// src/Api/http.js
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const extra = (Constants?.expoConfig && Constants.expoConfig.extra) || {};
function resolveDevBaseUrl() {
  const env =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    extra.EXPO_PUBLIC_API_BASE_URL;
  if (env) return env;
  if (Platform.OS === 'ios') return 'http://localhost:8000';   // ✅ iOS 시뮬레이터
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000';// ✅ Android 에뮬레이터
  return 'http://localhost:8000';                              // 웹/기타
}
export const baseUrl = resolveDevBaseUrl();
let ACCESS_TOKEN = null;
export function setAccessToken(t) { ACCESS_TOKEN = t || null; }

const http = axios.create({
  baseURL: baseUrl,
  timeout: 15000,
  // 웹에서만 쿠키 자동 포함
  withCredentials: Platform.OS === 'web',
});

http.interceptors.request.use((cfg) => {
  cfg.headers = { ...(cfg.headers || {}), 'X-Client': 'rn' };

  // 백엔드 수정 불가 → 둘 다 시도
  if (ACCESS_TOKEN) {
    // 헤더 토큰(혹시 서버가 지원하면 사용)
    cfg.headers.Authorization = `Bearer ${ACCESS_TOKEN}`;

    // 네이티브에선 쿠키 직접 헤더로 붙여도 됨
    if (Platform.OS !== 'web') {
      cfg.headers.Cookie = `access_token=${ACCESS_TOKEN}`;
    }
  }
  return cfg;
});

export default http;
