import 'dotenv/config';

export default {
  expo: {
    name: "indie-app",
    slug: "indie-app",
    scheme: "indieapp",
    android: {
      "package": "com.kimthreemun.indieapp",
    },
    plugins: [
      "expo-asset",
      "expo-secure-store",
    ],
    ios: {
      "bundleIdentifier": "com.kimthreemun.indieapp",
      infoPlist: {
        ncpKeyId: process.env.NAVER_MAP_KEY,
        "LSApplicationQueriesSchemes": [
          "kakaokompassauth",
          "kakaolink",
          "kakaoplus"
        ],
       "CFBundleURLTypes": [
          {
            "CFBundleURLSchemes": [
              "indieapp",
              process.env.KAKAO_SCHEME_KEY,
            ]
          }
        ]
      },
    },

    extra: {
      naverMapKey: process.env.NAVER_MAP_KEY,
      EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
      EXPO_PUBLIC_KAKAO_REDIRECT_URI: process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI,
    },
  },
};