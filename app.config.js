import 'dotenv/config';

export default {
  expo: {
    name: "indie-app",
    slug: "indie-app",
    scheme: "indieapp",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",

    android: {
      package: "com.kimthreemun.indieapp",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "INTERNET"
      ],
      edgeToEdgeEnabled: true,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },

    ios: {
      bundleIdentifier: "com.kimthreemun.indieapp",
      supportsTablet: true,
      usesAppleSignIn: true,
      entitlements: {
        "com.apple.developer.applesignin": ["Default"]
      },
      infoPlist: {
        // 구글 맵 API Key
        GMSApiKey: process.env.GOOGLE_MAPS_API_KEY,

        // 네이버 지도 키
        ncpKeyId: process.env.NAVER_MAP_KEY,

        // 카카오 URL 스킴 등록
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: [
              "indieapp",
              process.env.KAKAO_SCHEME_KEY,
            ],
          },
          {
            CFBundleURLSchemes: ["exp+indie-app"],
          },
        ],

        // 카카오 연동 관련 쿼리 스킴 허용
        LSApplicationQueriesSchemes: [
          "kakaokompassauth",
          "kakaolink",
          "kakaoplus",
        ],

        // 위치 접근 권한 문구
        NSLocationWhenInUseUsageDescription:
          "현재 위치를 기반으로 공연장을 보여주기 위해 사용됩니다.",
        NSLocationAlwaysUsageDescription:
          "앱이 백그라운드에서도 위치 정보를 사용할 수 있습니다.",
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "앱이 실행 중이거나 백그라운드에 있을 때 위치를 사용할 수 있습니다.",

        // 기타 권한 설명 (카메라·마이크 등)
        NSCameraUsageDescription:
          "공연 사진이나 리뷰 이미지를 업로드하기 위해 카메라 접근 권한이 필요합니다.",
        NSPhotoLibraryUsageDescription:
          "사진 업로드를 위해 사진 라이브러리 접근 권한이 필요합니다.",
        NSMicrophoneUsageDescription:
          "영상 녹화 시 마이크 사용 권한이 필요합니다.",
        NSFaceIDUsageDescription:
          "로그인 시 Face ID 인증을 위해 사용됩니다.",

        // 로컬 네트워킹 허용
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
          NSAllowsLocalNetworking: true,
        },
      },
    },

    plugins: [
      "expo-asset",
      "expo-secure-store",
      "expo-apple-authentication",
      [
        "expo-build-properties",
        {
          android: {
            extraMavenRepos: [
              "https://repository.map.naver.com/archive/maven",
              "https://devrepo.kakao.com/nexus/content/groups/public/"
            ]
          }
        }
      ]
    ],

    extra: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
      EXPO_PUBLIC_KAKAO_REDIRECT_URI: process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI,
      kakaoSchemeKey: process.env.KAKAO_SCHEME_KEY,
      naverMapKey: process.env.EXPO_PUBLIC_NAVER_MAP_KEY,
    },
  },
};
