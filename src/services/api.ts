import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { tokenStore } from './tokenStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const IS_DEV = process.env.NODE_ENV === 'development';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 segundos timeout
});

// 🔹 REQUEST INTERCEPTOR - Agrega token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = tokenStore.getAccess();

    // Agregar token si existe
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 📊 Logging en desarrollo (útil para debugging)
    if (IS_DEV) {
      console.log('🚀 Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasAuth: !!token,
      });
    }

    return config;
  },
  (error) => {
    // Manejo de errores en la configuración de request
    if (IS_DEV) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

//  🔹 RESPONSE INTERCEPTOR - Manejo de 401 + refresh automático
let refreshing = false;
let queue: Array<(token: string | null) => void> = [];

const runQueue = (newToken: string | null) => {
  queue.forEach((cb) => cb(newToken));
  queue = [];
};

api.interceptors.response.use(
  (res) => {
    // ✅ Respuesta exitosa
    if (IS_DEV) {
      console.log('✅ Response:', {
        status: res.status,
        url: res.config.url,
      });
    }
    return res;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as AxiosRequestConfig & { retry?: boolean };

    // 📊 Logging de errores
    if (IS_DEV) {
      console.error('❌ Response Error:', {
        status,
        url: original?.url,
        message: error.message,
      });
    }

    // 🚫 Manejo de errores específicos
    if (status === 403) {
      // Usuario no tiene permisos
      console.error('🚫 Acceso denegado (403): No tienes permisos para esta acción');
    }

    if (status === 404) {
      // Recurso no encontrado
      if (IS_DEV) {
        console.warn('🔍 Recurso no encontrado (404):', original?.url);
      }
    }

    if (status === 500) {
      // Error del servidor
      console.error('🔥 Error del servidor (500): Contacta al equipo de backend');
    }

    // 🔄 Manejo especial de 401 (token expirado)
    if (status !== 401 || original.retry) {
      return Promise.reject(error);
    }

    original.retry = true;

    // Si ya estamos refrescando, agregar a la cola
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

    // Iniciar proceso de refresh
    refreshing = true;
    try {
      const refreshToken = tokenStore.getRefresh();
      if (!refreshToken) {
        console.warn('⚠️ No hay refresh token disponible');
        tokenStore.clear();
        runQueue(null);
        // Redirigir al login si es necesario
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (IS_DEV) {
        console.log('🔄 Refrescando token...');
      }

      // Llamada de refresh con refreshToken
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken }, { headers: { 'Content-Type': 'application/json' } });
      const newAccess = data.accessToken as string | undefined;
      const newRefresh = data.refreshToken as string | undefined;

      if (!newAccess) {
        console.warn('⚠️ No se recibió nuevo access token');
        tokenStore.clear();
        runQueue(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      // Guardar nuevos tokens
      tokenStore.setAccess(newAccess);
      if (newRefresh) tokenStore.setRefresh(newRefresh);

      if (IS_DEV) {
        console.log('✅ Token refrescado exitosamente');
      }

      // Ejecutar cola de peticiones pendientes
      runQueue(newAccess);

      // Reintentar petición original con nuevo token
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (e) {
      console.error('❌ Error al refrescar token:', e);
      tokenStore.clear();
      runQueue(null);
      // Redirigir al login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(e);
    } finally {
      refreshing = false;
    }
  }
);
