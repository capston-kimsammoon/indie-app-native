import http from './http';

// 찜한 아티스트 목록
export const fetchLikedArtists = async (page = 1, size = 10) => {
  const { data } = await http.get('/favorite/artists/me', { params: { page, size } });
  return data;
};

// 아티스트 찜 ON
export const likeArtist = async (artistId) => {
  const { data } = await http.post('/like', { type: 'artist', refId: artistId });
  return data;
};

// 아티스트 찜 OFF
export const unlikeArtist = async (artistId) => {
  const { data } = await http.delete(`/like/${artistId}`, { params: { type: 'artist' } });
  return data;
};

// 아티스트 알림 ON
export const registerArtistAlert = async (artistId) => {
  const { data } = await http.post('/alert', { type: 'artist', refId: artistId });
  return data;
};

// 아티스트 알림 OFF
export const cancelArtistAlert = async (artistId) => {
  const { data } = await http.delete(`/alert/${artistId}`, { params: { type: 'artist' } });
  return data;
};
