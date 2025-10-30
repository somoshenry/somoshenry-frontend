const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

const safeGet = (key: string) => (typeof window === 'undefined' ? null : localStorage.getItem(key));
const safeSet = (key: string, val: string) => {
  if (typeof window !== 'undefined') localStorage.setItem(key, val);
};
const safeRemove = (key: string) => {
  if (typeof window !== 'undefined') localStorage.removeItem(key);
};

export const tokenStore = {
  getAccess: () => safeGet(ACCESS_KEY),
  getRefresh: () => safeGet(REFRESH_KEY),
  setAccess: (t: string) => safeSet(ACCESS_KEY, t),
  setRefresh: (t: string) => safeSet(REFRESH_KEY, t),
  clear: () => {
    safeRemove(ACCESS_KEY);
    safeRemove(REFRESH_KEY);
  },
};
