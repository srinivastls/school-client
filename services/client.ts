import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const api = axios.create({
  baseURL: "https://school-server-production-41f8.up.railway.app/api",
});

api.interceptors.request.use(async (config) => {
  const persistedUserDetails = await AsyncStorage.getItem("userStore");

  const accessToken = persistedUserDetails
    ? JSON.parse(persistedUserDetails)?.state?.accessToken
    : "";

  config.headers = {
    ...(config.headers ?? {}),
    "x-access-token": accessToken,
  };

  return config;
});