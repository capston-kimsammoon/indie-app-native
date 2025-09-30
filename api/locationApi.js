import axios from 'axios';

import { baseUrl } from './config';


//가까운공연 찾기-1.사용자 위치 기반 반경 3km이내 공연장 조회
/**
 * 사용자 위치 기준 3km 이내 공연장 조회 API
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




