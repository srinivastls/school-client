import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const api = axios.create({
  baseURL:
      //"http://localhost:3000/api",
    "https://school-server-production-41f8.up.railway.app/api",

  headers: {
    "Content-Type": "application/json",
  },
});

/*
 * ============================================================
 * REQUEST INTERCEPTOR
 * ============================================================
 */

api.interceptors.request.use(
  async (config) => {
    try {
      const persistedUserDetails =
        await AsyncStorage.getItem(
          "userStore"
        );

      if (!persistedUserDetails) {
        console.warn(
          "userStore does not exist in AsyncStorage"
        );

        console.log(
          "API REQUEST:",
          config.method?.toUpperCase(),
          config.url
        );

        console.log(
          "TOKEN PRESENT:",
          false
        );

        return config;
      }

      const parsed =
        JSON.parse(
          persistedUserDetails
        );

      const accessToken =
        parsed?.state?.accessToken;

      console.log(
        "API REQUEST:",
        config.method?.toUpperCase(),
        config.url
      );

      console.log(
        "TOKEN PRESENT:",
        Boolean(accessToken)
      );

      if (accessToken) {
        config.headers =
          config.headers ?? {};

        config.headers[
          "x-access-token"
        ] = accessToken;
      }

      return config;
    } catch (error) {
      console.error(
        "AUTH STORAGE ERROR:",
        error
      );

      return config;
    }
  },

  (error) => {
    return Promise.reject(error);
  }
);

/*
 * ============================================================
 * RESPONSE INTERCEPTOR
 * ============================================================
 *
 * This is ONLY for debugging right now.
 * It returns the COMPLETE Axios response.
 * ============================================================
 */

api.interceptors.response.use(
  (response) => {
    console.log(
      "================================="
    );

    console.log(
      "🔥 API RESPONSE"
    );

    console.log(
      "STATUS:",
      response.status
    );

    console.log(
      "URL:",
      response.config?.url
    );

    console.log(
      "RESPONSE DATA:",
      response.data
    );

    console.log(
      "RESPONSE DATA TYPE:",
      typeof response.data
    );

    if (
      response.data &&
      typeof response.data === "object"
    ) {
      console.log(
        "RESPONSE DATA KEYS:",
        Object.keys(response.data)
      );
    }

    console.log(
      "================================="
    );

    return response;
  },

  (error) => {
    console.log(
      "================================="
    );

    console.log(
      "🔥 API RESPONSE ERROR"
    );

    console.log(
      "STATUS:",
      error?.response?.status
    );

    console.log(
      "URL:",
      error?.config?.url
    );

    console.log(
      "ERROR DATA:",
      error?.response?.data
    );

    console.log(
      "================================="
    );

    return Promise.reject(error);
  }
);