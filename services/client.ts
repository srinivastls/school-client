import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, {
  AxiosError,
  AxiosRequestConfig,
} from "axios";
export const api = axios.create({
  baseURL:
      //"http://localhost:3000/api",
      //"http://10.81.49.212:3000/api",
      //"http://10.61.4.100:3000/api",
    "https://school-server-production-41f8.up.railway.app/api",
    //"https://school-management-d0ccfbbd10d1.herokuapp.com/api",


    timeout: 50000,

  headers: {
    "Content-Type": "application/json",
  },
});

/*
 * ============================================================
 * REQUEST INTERCEPTOR
 * ============================================================
 */

const USER_STORE_KEY = "userStore";

type StoredAuthState = {
  accessToken?: string;
  refreshToken?: string;
};

const getAuthState = async (): Promise<StoredAuthState | null> => {
  const raw = await AsyncStorage.getItem(USER_STORE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return parsed?.state ?? null;
  } catch {
    return null;
  }
};

const saveAccessToken = async (accessToken: string) => {
  const raw = await AsyncStorage.getItem(USER_STORE_KEY);
  if (!raw) return;

  const parsed = JSON.parse(raw);

  parsed.state = {
    ...parsed.state,
    accessToken,
  };

  await AsyncStorage.setItem(
    USER_STORE_KEY,
    JSON.stringify(parsed)
  );
};

api.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    try {
      const state = await getAuthState();
      const accessToken = state?.accessToken;

      if (accessToken) {
        config.headers = config.headers ?? {};
        config.headers["x-access-token"] = accessToken;
      }

      return config;
    } catch (error) {
      console.error("AUTH STORAGE ERROR:", error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const state = await getAuthState();
      const refreshToken = state?.refreshToken;

      if (!refreshToken) return null;

      // Use plain axios here, not `api`, so the refresh request
      // cannot recursively trigger this interceptor.
      const response = await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        { refreshToken },
        {
          timeout: 50000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const newAccessToken = response.data?.accessToken;

      if (!newAccessToken) return null;

      await saveAccessToken(newAccessToken);

      return newAccessToken;
    } catch (error) {
      console.error(
        "REFRESH TOKEN ERROR:",
        (error as AxiosError)?.response?.data ?? error
      );

      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const status = error.response?.status;
    const data = error.response?.data as
      | { code?: string; message?: string }
      | undefined;

    const tokenExpired =
      status === 401 && data?.code === "TOKEN_EXPIRED";

    if (!tokenExpired || !originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const newAccessToken = await refreshAccessToken();

    if (!newAccessToken) {
      // Do not automatically navigate to login here.
      // Your existing auth/navigation layer can handle a real
      // session-expiry response if the 7-day refresh token is gone.
      return Promise.reject(error);
    }

    originalRequest.headers = originalRequest.headers ?? {};
    originalRequest.headers["x-access-token"] = newAccessToken;

    return api.request(originalRequest);
  }
);
