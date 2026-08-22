import { CommonResponse } from "./commonApiTypes";
import { Admin } from "./entityTypes";

export type GetAllUsersResponse = CommonResponse & { users: Admin[] };
