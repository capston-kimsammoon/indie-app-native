// src/api/stampApi.js
import http from './http';

/** 최근 N일(기본 3일) 스탬프 후보 */
export const fetchAvailableStamps = async (days = 3) => {
  const { data } = await http.get('/stamps/available', { params: { days } });
  return data;
};

export const fetchCollectedStamps = async (opts = {}) => {
  const { startMonth, endMonth, startYear, endYear } = opts;
  const params = {};
  if (startMonth != null) params.startMonth = startMonth;
  if (endMonth != null) params.endMonth = endMonth;
  if (startYear != null) params.startYear = startYear;
  if (endYear != null) params.endYear = endYear;

  const { data } = await http.get('/stamps/collected', { params });
  return data;
};

/** 스탬프 수집 */
export const collectStamp = async (performanceId) => {
  const { data } = await http.post('/stamps/collect', {
    stampId: performanceId, 
  });
  return data;
};
