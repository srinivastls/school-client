import create from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/client";
import { zustandStorage } from "../storage";
import { Admin, SinginResponse } from "../types";

export type UserStore = {
  user: Admin | null;
  accessToken: string | null;
  /**time in millisecond after which accessToken will expire */
  accessTokenTTL: number | null;
  accessTokenFetchedAt: number | null;
  setUserDetailsFromResponse: (
    response: SinginResponse
  ) => Pick<
    UserStore,
    "user" | "accessToken" | "accessTokenFetchedAt" | "accessTokenTTL"
  >;
  logout: () => void;
};

export const useUserStore = create(
  persist<UserStore>(
    (set, get) => ({
      user: null,
      accessToken: null,
      accessTokenTTL: null,
      accessTokenFetchedAt: null,

      setUserDetailsFromResponse: (response: SinginResponse) => {
        const {
          name,
          roles,
          designation,
          adminId,
          email,
          accessToken,
          accessTokenTTL,
        } = response;
        const userStoreData = {
          user: { name, roles, designation, adminId, email },
          accessToken,
          accessTokenTTL,
          accessTokenFetchedAt: Date.now(),
        };
        set(userStoreData);
        api.defaults.headers.common["x-access-token"] = accessToken;
        // api.setHeader("x-access-token", accessToken);
        return userStoreData;
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          accessTokenTTL: null,
          accessTokenFetchedAt: null,
        });
      },
    }),
    { name: "userStore", getStorage: () => zustandStorage }
  )
);
