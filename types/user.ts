// ====== 공용 타입 ======
export type User = {
  id: number;
  nickname: string;
  profile_url?: string | null;
  alarm_enabled?: boolean | null;
  location_enabled?: boolean | null;
  // 필요 시 필드 추가...
  [k: string]: any;
};

export type UpdateSettingsBody = {
  alarm_enabled?: boolean;
  location_enabled?: boolean;
};

export type LogoutResponse = { message: string };

// RN ImagePicker 등에서 넘어오는 대충의 형태를 수용
export type AssetLike = {
  uri: string;
  fileName?: string;
  mimeType?: string;
};