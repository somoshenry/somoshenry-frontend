import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { tokenStore } from './tokenStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: BASE_URL,
 
});

// Adjunta Authorization si hay accessToken 
api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//  Manejo de 401 + cola para refresh concurrente 
let refreshing = false;
let queue: Array<(token: string | null) => void> = [];

const runQueue = (newToken: string | null) => {
  queue.forEach((cb) => cb(newToken));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as AxiosRequestConfig & { retry?: boolean };

    if (status !== 401 || original.retry) {
      return Promise.reject(error);
    }
    original.retry = true;

    // si ya estamos refrescando, esperar el resultado
    if (refreshing) {
      return new Promise((resolve, reject) => {
        queue.push((newToken) => {
          if (newToken) {
            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(original));
          } else {
            reject(error);
          }
        });
      });
    }

    // iniciar refresh
    refreshing = true;
    try {
      const refreshToken = tokenStore.getRefresh();
      if (!refreshToken) {
        tokenStore.clear();
        runQueue(null);
        return Promise.reject(error);
      }

      // Llamada de refresh con refreshToken (en body)
      const { data } = await axios.post(
        `${BASE_URL}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const newAccess = data.accessToken as string | undefined;
      const newRefresh = data.refreshToken as string | undefined;

      if (!newAccess) {
        tokenStore.clear();
        runQueue(null);
        return Promise.reject(error);
      }

      tokenStore.setAccess(newAccess);
      if (newRefresh) tokenStore.setRefresh(newRefresh);

      runQueue(newAccess);

      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (e) {
      tokenStore.clear();
      runQueue(null);
      return Promise.reject(e);
    } finally {
      refreshing = false;
    }
  }
);
