// api/http.ts
import axios from 'axios';
import config from './config';
import { TEST_TOKEN } from '@env';

const http = axios.create({
  baseURL: config.baseUrl,
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json',
    Cookie: `access_token=${TEST_TOKEN};`, // 쿠키로 테스트용 JWT 전송
    Authorization: `Bearer ${TEST_TOKEN}`, // 헤더로도 보낼 수 있음
  },
  withCredentials: true, // 쿠키 전송
});

// 요청 인터셉터: 필요하면 토큰 등 추가
http.interceptors.request.use(
  (request) => {
    // 예: 토큰 자동 첨부
    // const token = getTokenFromStorage();
    // if (token) request.headers.Authorization = `Bearer ${token}`;

    // 임시 개발용 토큰
    if (TEST_TOKEN) {
      request.headers.Authorization = `Bearer ${TEST_TOKEN}`;
    }

    // 필요하면 /auth/ 요청 처리
    const url = typeof request.url === 'string' ? request.url : '';
    if (url.startsWith('/auth/')) request.baseURL = config.baseUrl;

    return request;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 공통 에러 처리
http.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('HTTP Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default http;
