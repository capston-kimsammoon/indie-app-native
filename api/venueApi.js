import axios from 'axios';

import { baseUrl } from './config';


//가까운공연 찾기-1.사용자 위치 기반 반경 3km이내 공연장 조회
/**
 *  사용자 위치 기준 3km 이내 공연장 조회 API
 * GET /nearby/venue
 * Params: lat, lng, radius
 * 인증 필요 없음
 */
export const fetchNearbyVenues = async (lat, lng, radius = 3) => {
  try {
    const response = await axios.get(`${baseUrl}/nearby/venue`, {
      params: { lat, lng, radius },
    });
    return response.data;
  } catch (error) {
    console.error(' 주변 공연장 조회 실패:', error);
    throw error;
  }
};



// 공연장 - 1. 공연장 목록 조회 


/**
 * 공연장 목록 조회
 * Method: GET
 * Endpoint: /venue
 * Query Params: page, size, region
 * 인증:  필요 없음
 */
// 공연장 - 2. 공연장 상세 정보 조회 
export const fetchVenueList = async ({ page, size, region }) => {
  try {
    // 1) region 직렬화
    let regionParam;

    if (Array.isArray(region)) {
      regionParam = region.length > 0 ? region.join(",") : undefined;
    } else if (typeof region === "string" && region.trim() !== "") {
      regionParam = region.trim();
    }

    // 2) API 호출
    const { data } = await axios.get(`${baseUrl}/venue`, {
      params: { page, size, region: regionParam },
    });

    // 3) 안전하게 venues 배열만 뽑기
    const venues =
      Array.isArray(data?.venue)   ? data.venue   :
      Array.isArray(data?.venues)  ? data.venues  :
      Array.isArray(data?.items)   ? data.items   :
      Array.isArray(data)          ? data         : [];

    // 4) 필요시 페이지네이션 정보 같이 반환
    return {
      venues,
      page: data?.page ?? page ?? 1,
      totalPages: data?.totalPages ?? data?.pages ?? undefined,
      total: data?.total ?? undefined,
      raw: data, // 원본 그대로, 혹시 디버깅/확장 필요할 때 사용
    };
  } catch (error) {
    console.error("❌ 공연장 목록 조회 실패:", error.response?.data || error.message);
    throw error;
  }
};


/**
 *  공연장 상세 정보 조회
 * Method: GET
 * Endpoint: /venue/{id}
 * Path Param: id (공연장 ID)
 * 인증:  필요 없음
 */
export const fetchVenueDetail = async (venueId) => {
  try {
    const response = await axios.get(`${baseUrl}/venue/${venueId}`);
    return response.data;
  } catch (error) {
    console.error(' 공연장 상세 정보 조회 실패:', error);
    throw error;
  }
};



// venueApi.js 맨 아래에 추가
export const fetchUpcomingPerformancesByVenue = async (venueId, afterTime) => {
  try {
    const { data } = await axios.get(`${baseUrl}/nearby/venue/${venueId}/performance`, {
      params: { after: afterTime },
    });
    // 배열 안전 반환
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.performances)) return data.performances;
    return [];
  } catch (error) {
    console.error('❌ 특정 공연장 예정 공연 조회 실패:', error.response?.data || error.message);
    throw error;
  }
};


