import axios from "axios";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL ?? "") + "/api/v1",
  withCredentials: true, // send refresh token cookie
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isRefreshCall = original.url?.includes("/auth/refresh");
    if (error.response?.status === 401 && !original._retry && !isRefreshCall) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(
          (import.meta.env.VITE_API_URL ?? "") + "/api/v1/auth/refresh",
          {},
          { withCredentials: true }
        );
        setAccessToken(data.access_token);
        queue.forEach((cb) => cb(data.access_token));
        queue = [];
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch {
        setAccessToken(null);
        queue = [];
        window.location.href = "/auth";
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
