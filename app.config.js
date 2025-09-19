import 'dotenv/config';

export default {
  expo: {
    name: "indie-app",
    slug: "indie-app",

    android: {
      "package": "com.kimthreemun.indieapp",
      config: {
        // Naver Map은 Google Map처럼 Expo 설정에 직접 키를 박는 게 아니라
        // native SDK에서 Info.plist / Manifest에 필요함
      },
    },

    ios: {
      "bundleIdentifier": "com.kimthreemun.indieapp",
      infoPlist: {
        NMFClientId: process.env.NAVER_MAP_KEY, // 네이버 지도 iOS 설정
      },
    },

    extra: {
      naverMapKey: process.env.NAVER_MAP_KEY, // JS 코드에서 사용
    },
  },
};
