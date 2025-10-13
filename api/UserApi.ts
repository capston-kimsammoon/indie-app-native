// api/UserApi.ts
import http , {clearAccessToken, getAccessToken} from "./http";
import type { AxiosError } from "axios";
import { User, UpdateSettingsBody, LogoutResponse, AssetLike} from "@/types/user";
import { useAuthStore } from "@/src/state/authStore";

// ====== 유틸 ======
function parseAxiosErr(e: unknown): never {
  const ax = e as AxiosError<any>;
  const status = ax?.response?.status;
  const data = ax?.response?.data;
  const msg = (data && (data.message || data.detail)) || ax?.message || "error";
  const err = new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  (err as any).status = status;
  throw err;
}

function normalizeFileUri(uri: string): string {
  return uri.startsWith("file://") ? uri : `file://${uri}`;
}

// ====== API ======

/** 1) 로그인 후 사용자 정보 조회 (401/403 → null) */
export async function fetchUserInfo(): Promise<User | null> {
  try {
    const { data } = await http.get<User>("/user/me");
    return data;
  } catch (e) {
    const ax = e as AxiosError<any>;
    const s = ax?.response?.status;
    if (s === 401 || s === 403) return null;
    return parseAxiosErr(e);
  }
}

/** 2) 닉네임 수정 */
export async function updateNickname(nickname: string): Promise<User> {
  try {
    const { data } = await http.patch<User>("/user/me", { nickname });
    return data;
  } catch (e) {
    return parseAxiosErr(e);
  }
}

/** 3-1) 프로필 이미지 변경 (React Native: FormData 업로드) */
export async function updateProfileImage(
  assetOrFile: AssetLike
): Promise<{ profileImageUrl?: string } & Partial<User>> {
  if (!assetOrFile?.uri) throw new Error("이미지가 없습니다.");

  const file = {
    uri: normalizeFileUri(assetOrFile.uri),
    name: assetOrFile.fileName || `profile_${Date.now()}.jpg`,
    type: assetOrFile.mimeType || "image/jpeg",
  } as any;

  const formData = new FormData();
  formData.append("profileImage", file);

  try {
    // RN에선 boundary 문제 피하려고 Content-Type을 직접 지정하지 않는 게 안전
    const { data } = await http.patch("/user/me/profile-image", formData);
    return data ?? {};
  } catch (e) {
    return parseAxiosErr(e);
  }
}

/** 3-2) 프로필 이미지 제거 */
export async function removeProfileImage(): Promise<{ profileImageUrl?: string } & Partial<User>> {
  try {
    const { data } = await http.patch("/user/me/profile-image");
    return data ?? {};
  } catch (e) {
    return parseAxiosErr(e);
  }
}

/** 4) 알림/위치 설정 ON/OFF */
export async function updateUserSettings(
  alarmEnabled?: boolean,
  locationEnabled?: boolean
): Promise<User> {
  const body: UpdateSettingsBody = {};
  if (typeof alarmEnabled === "boolean") body.alarm_enabled = alarmEnabled;
  if (typeof locationEnabled === "boolean") body.location_enabled = locationEnabled;

  try {
    const { data } = await http.patch<User>("/user/me/setting", body);
    return data;
  } catch (e) {
    return parseAxiosErr(e);
  }
}

/** 5) 로그아웃 (비로그인이라도 조용히 통과) */
export async function logoutApi(): Promise<LogoutResponse> {
  try {
    const { data } = await http.post<LogoutResponse>("/auth/logout");
    return data;
  } catch {
    return { message: "이미 로그아웃 상태입니다." };
  }
}
/** 6) 선택적 유저 조회 (그냥 래핑) */
export async function fetchUserInfoOptional(): Promise<User | null> {
  return fetchUserInfo();
}

export async function withdrawAccount() {
  try {
    const res = await http.delete("/auth/withdraw", {
      headers: { "x-silent-error": "1" },
    });
    return res.data;
  } catch (e: any) {
    if (e?.response?.status === 401) return { message: "탈퇴되었습니다." };
    throw e;
  } finally {
    clearAccessToken();
  }
}