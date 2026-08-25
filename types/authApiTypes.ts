import { CommonResponse } from "./commonApiTypes";
import { SchoolUserRole } from "./entityTypes";

export type SignupRequest = {
  name: string;
  password: string;
  email: string;
  designation: string;
  adminId: string;
  roles?: SchoolUserRole[];
};
export type SignupResponse = CommonResponse;

export type SigninRequest = { email: string; password: string };


export type DeleteUserRequest = { email: string };
export type DeleteUserResponse = CommonResponse;
