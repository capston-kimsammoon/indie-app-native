import 'dotenv/config';

export default {
  expo: {
    name: "indie-app",
    slug: "indie-app",
    scheme: "indieapp",
    android: {
      "package": "com.kimthreemun.indieapp",
      config: {
        // Naver Map은 Google Map처럼 Expo 설정에 직접 키를 박는 게 아니라
        // native SDK에서 Info.plist / Manifest에 필요함

      },
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
              "kakaob028df37249860db9c9d0587a3541152"
            ]
          }
        ]
      },
    },

    extra: {
      naverMapKey: process.env.NAVER_MAP_KEY,
      EXPO_PUBLIC_API_BASE_URL: "http://172.20.10.3:8000",
      EXPO_PUBLIC_KAKAO_REDIRECT_URI: "http://172.20.10.3:8081/auth/callback"
    },
  },
};
