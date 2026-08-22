import { GetAllUsersResponse } from "../types/userApiTypes";
import { api } from "./client";

const endpoints = {
  getAll: "/users/getAll",
};

export const getAllUsers = async () => {
  const res = await api.get<GetAllUsersResponse>(endpoints.getAll);
  return res.data;
};
