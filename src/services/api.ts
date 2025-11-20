import axios, {AxiosError, AxiosRequestConfig} from "axios";

export const api = axios.create({
  baseURL: "http://tu-back.com/api",
});

let isRefreshing = false;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as AxiosRequestConfig & {_retry?: boolean};

    // ⛔ 403 → No expulsar, solo avisar
    if (status === 403) {
      console.warn("⚠ 403 – Usuario sin permiso, pero la sesión sigue");
      return Promise.reject(error);
    }

    // ❌ Si es 401 y ya hicimos reintento → desloguear
    if (status === 401 && original._retry) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // 🔄 Intentar refrescar token
    if (status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) return Promise.reject(error);
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No hay refresh token");

        const resp = await axios.post("http://tu-back.com/api/refresh", {
          refreshToken,
        });

        const newAccess = resp.data.accessToken;
        localStorage.setItem("accessToken", newAccess);

        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccess}`;

        isRefreshing = false;

        return api(original);
      } catch (err) {
        isRefreshing = false;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);
