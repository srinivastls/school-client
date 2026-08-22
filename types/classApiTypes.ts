import { CommonResponse } from "./commonApiTypes";
import { Class } from "./entityTypes";

export type GetAllClassesResponse = CommonResponse & {
  classes: Class[];
};

export type CreateClassRequest = Class;
export type CreateClassResponse = CommonResponse;

export type GetClassResponse = Class;

export type EditClassRequest = Class;
export type EditClassResponse = CommonResponse;

export type DeleteClassRequest = Pick<Class, "classNumber">;
export type DeleteClassResponse = CommonResponse;
