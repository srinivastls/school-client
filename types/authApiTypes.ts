import { CommonResponse } from "./commonApiTypes";
import { Admin, Roles } from "./entityTypes";

export type SignupRequest = {
  name: string;
  password: string;
  email: string;
  designation: string;
  adminId: string;
  roles?: Roles[];
};
export type SignupResponse = CommonResponse;

export type SigninRequest = { email: string; password: string };
export type SinginResponse = CommonResponse &
  Admin & {
    accessToken: string;
    accessTokenTTL: number;
  };

export type DeleteUserRequest = { email: string };
export type DeleteUserResponse = CommonResponse;
