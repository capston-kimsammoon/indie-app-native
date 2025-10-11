// api/UserApi.ts
import http , {clearAccessToken, getAccessToken} from "./http";
import type { AxiosError } from "axios";
import { User, UpdateSettingsBody, LogoutResponse, AssetLike} from "@/types/user";
import { useAuthStore } from "@/src/state/authStore";

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

export async function fetchUserInfo() {
  const token = useAuthStore.getState().token;
  if (!token) {
    return null;
  }
  const { data } = await http.get("/user/me");
  return data;
}



export async function updateNickname(nickname: string): Promise<User> {
  try {
    const { data } = await http.patch<User>("/user/me", { nickname });
    return data;
  } catch (e) {
    return parseAxiosErr(e);
  }
}

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
    const { data } = await http.patch("/user/me/profile-image", formData);
    return data ?? {};
  } catch (e) {
    return parseAxiosErr(e);
  }
}

export async function removeProfileImage(): Promise<{ profileImageUrl?: string } & Partial<User>> {
  try {
    const { data } = await http.patch("/user/me/profile-image");
    return data ?? {};
  } catch (e) {
    return parseAxiosErr(e);
  }
}

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

export async function logoutApi(): Promise<LogoutResponse> {
  try {
    const { data } = await http.post<LogoutResponse>("/auth/logout");
    return data;
  } catch {
    return { message: "이미 로그아웃 상태입니다." };
  }
}
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
