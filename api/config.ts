// config.ts
const config = {
  baseUrl:
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    'http://192.168.35.53:8000', // 기본값: 실제 API 주소
  timeout: 5000, // 5초 타임아웃
};

export default config;
