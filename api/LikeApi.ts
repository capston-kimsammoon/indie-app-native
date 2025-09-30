// /api/LikeApi.ts
import http from "./http";

export const TYPE_PERFORMANCE = 'performance';
export const TYPE_ARTIST = 'artist';

// 찜 ON
export const like = async (type: 'performance' | 'artist', refId: number) => {
  try {
    const { data } = await http.post('/like', { type, refId });
    return data;
  } catch (err: any) {
    console.error(`${type} 찜 ON 실패:`, err.response?.data || err.message);
    throw err;
  }
};

// 찜 OFF
export const unlike = async (type: 'performance' | 'artist', refId: number) => {
  try {
    const { data } = await http.delete(`/like/${refId}`, { params: { type } });
    return data;
  } catch (err: any) {
    console.error(`${type} 찜 OFF 실패:`, err.response?.data || err.message);
    throw err;
  }
};
