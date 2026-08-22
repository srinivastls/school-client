import { useUserStore } from "../store";
import {
  DeleteUserRequest,
  DeleteUserResponse,
  SigninRequest,
  SignupRequest,
  SignupResponse,
  SinginResponse,
} from "../types";
import { api } from "./client";

const endpoints = {
  signin: "/auth/signin",
  signup: "/auth/signup",
  delete: "/auth/delete",
};

const signin = async (payload: SigninRequest) => {
  const response = await api.post<SinginResponse>(endpoints.signin, payload);
  if (response.data) {
    return useUserStore.getState().setUserDetailsFromResponse(response.data);
  }
};

const signup = (payload: SignupRequest) => {
  return api.post<SignupResponse>(endpoints.signup, payload);
};

const deleteUser = (payload: DeleteUserRequest) => {
  return api.post<DeleteUserResponse>(endpoints.delete, payload);
};

export const userServices = { signin, signup, deleteUser };
