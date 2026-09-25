


import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const api = axios.create({
  baseURL:
      //"http://localhost:3000/api",
      "http://10.81.51.200:3000/api",
    //"https://school-server-production-41f8.up.railway.app/api",
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


        return config;
      }

      const parsed =
        JSON.parse(
          persistedUserDetails
        );

      const accessToken =
        parsed?.state?.accessToken;



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
    
    if (
      response.data &&
      typeof response.data === "object"
    ) {
      
    }

    return response;
  },

  (error) => {
    console.log(
      "URL:",
      error?.config?.url
    );

    console.log(
      "ERROR DATA:",
      error?.response?.data
    );

    return Promise.reject(error);
  }
);