import create from "zustand";
import {
  persist,
} from "zustand/middleware";

import { api } from "../services/client";
import { zustandStorage } from "../storage";

export type StoredUser = {
  id: string;
  name: string;
  email: string;

  role:
    | "PLATFORM_ADMIN"
    | "PRINCIPAL"
    | "ADMIN"
    | "TEACHER"
    | "PARENT";

  designation: string | null;

  schoolId: string;
  schoolCode: string;
  schoolName: string;
};

export type LoginResponse = {
  id: string;
  name: string;
  email: string;

  role:
    | "PLATFORM_ADMIN"
    | "PRINCIPAL"
    | "ADMIN"
    | "TEACHER"
    | "PARENT";

  designation: string | null;

  schoolId: string;
  schoolCode: string;
  schoolName: string;

  accessToken: string;
  accessTokenTTL: number;
  accessTokenFetchedAt?: number;
};

export type UserStore = {
  user: StoredUser | null;

  accessToken: string | null;

  accessTokenTTL: number | null;

  accessTokenFetchedAt: number | null;

  /**
   * IMPORTANT:
   * false = Zustand has not restored
   * the persisted state yet.
   */
  hasHydrated: boolean;

  setUserDetailsFromResponse: (
    response: LoginResponse
  ) => void;

  logout: () => void;
};

export const useUserStore =
  create<UserStore>()(
    persist(
      (set) => ({
        user: null,

        accessToken: null,

        accessTokenTTL: null,

        accessTokenFetchedAt: null,

        hasHydrated: false,

        setUserDetailsFromResponse: (
          response
        ) => {
          const user: StoredUser = {
            id: response.id,
            name: response.name,
            email: response.email,

            role: response.role,

            designation:
              response.designation ?? null,

            schoolId:
              response.schoolId,

            schoolCode:
              response.schoolCode,

            schoolName:
              response.schoolName,
          };

          const accessTokenFetchedAt =
            response.accessTokenFetchedAt ??
            Date.now();

          set({
            user,

            accessToken:
              response.accessToken,

            accessTokenTTL:
              response.accessTokenTTL,

            accessTokenFetchedAt,

            hasHydrated: true,
          });

          /*
           * Keep Axios default header updated
           * immediately after login.
           */
          api.defaults.headers.common[
            "x-access-token"
          ] =
            response.accessToken;
        },

        logout: () => {
          delete api.defaults.headers.common[
            "x-access-token"
          ];

          set({
            user: null,

            accessToken: null,

            accessTokenTTL: null,

            accessTokenFetchedAt: null,

            hasHydrated: true,
          });
        },
      }),

      {
        name: "userStore",

        getStorage: () =>
          zustandStorage,

        /*
         * IMPORTANT
         *
         * Zustand calls this after the persisted
         * state has been restored.
         */
        onRehydrateStorage: () => {
          return (state) => {
            if (!state) {
              useUserStore.setState({
                hasHydrated: true,
              });

              return;
            }

            /*
             * Restore Axios header after refresh.
             */
            if (
              state.accessToken
            ) {
              api.defaults.headers.common[
                "x-access-token"
              ] =
                state.accessToken;
            }

            useUserStore.setState({
              hasHydrated: true,
            });
          };
        },
      }
    )
  );