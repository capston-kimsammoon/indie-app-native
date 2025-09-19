// constants/theme.ts

export default {
  colors: {
    // 기본 색상
    black: '#1C1C1E',
    //white: '#FFFFFF',
    white: '#FAFAFA',

    // 회색 계열
    darkGray: '#4B4B4B',
    gray: '#B0B0B0',
    lightGray: '#E4E4E4',
    tabBarGray: 'F1F1F1',
    shadow: 'rgba(0,0,0,0.2)',

    // 테마 색상
    themeOrange: '#F68B4D',
  },

  fontSizes: {
    xxs: 10,
    xs: 12,
    sm: 14,
    base: 16,
    lg: 20,
    xl: 24,
  },

  fontWeights: {
    thin: "100" as const,
    light: "300" as const,
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    black: "900" as const,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  },

  iconSizes: {
    xs: 12,
    sm: 16,
    md: 24,
    lg: 28, // 탭바 아이콘 크기
    xl: 32,
  },
};