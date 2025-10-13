// types/auth.ts

export type TokenLike = {
  accessToken?: string;
  access?: string;
  refreshToken?: string;
  refresh?: string;
  [k: string]: any;
};

export type KakaoLoginInitResponse = {
  loginUrl: string;
  state?: string;
};

export type WebTokenPair = {
  access: string;
  refresh?: string;
};

export type AppleLoginNeeds = {
  terms?: boolean;
  profile?: boolean;
};

export type AppleLoginResult = {
  token: string;
  user?: any;
  raw?: any;
  isNew?: boolean;
  needs?: { terms?: boolean; profile?: boolean };
  firstAppleAuth?: boolean;
};

export type EmailAuthResponse = TokenLike;
