import { CommonResponse } from "./commonApiTypes";
import { SchoolUserRole } from "./entityTypes";

export type GetAllUsersResponse = CommonResponse & { users: SchoolUserRole[] };

export type DeleteUserRequest = { email: string };
export type DeleteUserResponse = CommonResponse;