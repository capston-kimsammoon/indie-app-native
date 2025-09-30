// /api/AlertApi.ts
import http from './http';

export const TYPE_PERFORMANCE = 'performance';
export const TYPE_ARTIST = 'artist';

// 알림 ON
export const enableAlert = async (type: 'performance' | 'artist', refId: number) => {
  try {
    const { data } = await http.post('/alert', { type, refId });
    return data;
  } catch (err: any) {
    console.error(`${type} 알림 ON 실패:`, err.response?.data || err.message);
    throw err;
  }
};

// 알림 OFF
export const disableAlert = async (type: 'performance' | 'artist', refId: number) => {
  try {
    const { data } = await http.delete(`/alert/${refId}`, { params: { type } });
    return data;
  } catch (err: any) {
    console.error(`${type} 알림 OFF 실패:`, err.response?.data || err.message);
    throw err;
  }
};