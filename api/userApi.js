// src/api/userApi.js
import http from '@/Api/http';

// 1) 로그인 후 사용자 정보 조회 (401/403 → null 반환)
export const fetchUserInfo = async () => {
  try {
    const { data } = await http.get('/user/me');
    return data; // { id, nickname, ... }
  } catch (e) {
    const s = e?.response?.status;
    if (s === 401 || s === 403) return null; // 비로그인으로 간주
    throw e; // 그 외 에러는 위로
  }
};

// 2) 닉네임 수정
export const updateNickname = async (nickname) => {
  const { data } = await http.patch('/user/me', { nickname });
  return data;
};

// 3-1) 프로필 이미지 변경 (RN: FormData)
export const updateProfileImage = async (assetOrFile) => {
  if (!assetOrFile) throw new Error('이미지가 없습니다.');
  const file = {
    uri: assetOrFile.uri?.startsWith('file://')
      ? assetOrFile.uri
      : `file://${assetOrFile.uri}`,
    name: assetOrFile.fileName || `profile_${Date.now()}.jpg`,
    type: assetOrFile.mimeType || 'image/jpeg',
  };
  const formData = new FormData();
  formData.append('profileImage', file);

  // RN에선 Content-Type을 직접 지정하지 않는 편이 boundary 문제를 피하기 좋음
  const { data } = await http.patch('/user/me/profile-image', formData);
  return data; // { profileImageUrl } 가정
};

// 3-2) 프로필 이미지 제거
export const removeProfileImage = async () => {
  const { data } = await http.patch('/user/me/profile-image', {});
  return data;
};

// 4) 알림/위치 설정 ON/OFF
export const updateUserSettings = async (alarmEnabled, locationEnabled) => {
  const body = { alarm_enabled: alarmEnabled, location_enabled: locationEnabled };
  const { data } = await http.patch('/user/me/setting', body);
  return data;
};

// 5) 로그아웃
export const logout = async () => {
  try {
    const { data } = await http.post('/auth/logout');
    return data;
  } catch (e) {
    // 비로그인 상태에서 호출해도 조용히 통과
    return { message: '이미 로그아웃 상태입니다.' };
  }
};

// 6) 선택적 유저 조회 (그냥 위 함수 재사용)
export const fetchUserInfoOptional = async () => {
  return await fetchUserInfo(); // 로그인 상태면 객체, 아니면 null
};
