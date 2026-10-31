
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, {
  AxiosError,
  type AxiosRequestConfig,
} from "axios";

import { handleSessionExpired } from "./sessionBridge";

export const api = axios.create({
  baseURL: //"http://localhost:3000/api",
      //"http://10.81.53.179:3000/api",
    //"http://10.61.4.100:3000/api",
   "https://school-server-production-41f8.up.railway.app/api",
   //"https://school-management-d0ccfbbd10d1.herokuapp.com/api",
  timeout: 50000,
  headers: {
    "Content-Type": "application/json",
  },
});

const USER_STORE_KEY = "userStore";

type StoredAuthState = {
  accessToken?: string;
  refreshToken?: string;
};

type RefreshResponse = {
  accessToken?: string;
};

type ApiErrorResponse = {
  code?: string;
  message?: string;
};

type RetryableRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
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

const saveAccessToken = async (accessToken: string): Promise<void> => {
  const raw = await AsyncStorage.getItem(USER_STORE_KEY);

  if (!raw) {
    throw new Error("Stored authentication state not found.");
  }

  const parsed = JSON.parse(raw);

  parsed.state = {
    ...parsed.state,
    accessToken,
  };

  await AsyncStorage.setItem(USER_STORE_KEY, JSON.stringify(parsed));
};

// Attach the current access token to each request.
api.interceptors.request.use(
  async (config) => {
    try {
      const state = await getAuthState();

      if (state?.accessToken) {
        config.headers ??= {};
        config.headers = {
          ...config.headers,
          "x-access-token": state.accessToken,
        };
      }
    } catch (error) {
      console.error("[AUTH] Could not read stored token:", error);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Share one refresh operation across concurrent requests.
let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async (): Promise<string | null> => {
    try {
      const state = await getAuthState();
      const refreshToken = state?.refreshToken;

      if (!refreshToken) {
        console.warn("[AUTH] No refresh token found.");
        await handleSessionExpired();
        return null;
      }

      // Plain axios prevents the API interceptors from recursively
      // attempting to refresh the refresh request.
      const response = await axios.post<RefreshResponse>(
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

      if (!newAccessToken) {
        console.error("[AUTH] Refresh response has no accessToken.");
        await handleSessionExpired();
        return null;
      }

      await saveAccessToken(newAccessToken);

      api.defaults.headers.common["x-access-token"] = newAccessToken;

      console.log("[AUTH] Access token refreshed successfully.");
      return newAccessToken;
    } catch (error) {
      const refreshError = error as AxiosError<ApiErrorResponse>;
      const status = refreshError.response?.status;

      console.error(
        "[AUTH] Refresh failed:",
        status,
        refreshError.response?.data ?? refreshError.message
      );

      if (status === 401 || status === 403) {
        // Invalid or expired refresh token: clear session and redirect.
        await handleSessionExpired();
      } else if (status === undefined) {
        // A network error does not necessarily mean the session expired.
        console.error("[AUTH] Refresh request had no server response.");
      } else {
        // Do not log out automatically for other server errors.
        console.error("[AUTH] Unexpected refresh server error:", status);
      }

      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest =
      error.config as RetryableRequestConfig | undefined;

    const status = error.response?.status;
    const data = error.response?.data;

    // Keep this condition aligned with your backend's actual error response.
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
      return Promise.reject(error);
    }

    originalRequest.headers ??= {};
    originalRequest.headers = {
      ...originalRequest.headers,
      "x-access-token": newAccessToken,
    };

    return api.request(originalRequest);
  }
);
