import {
  CreateClassRequest,
  CreateClassResponse,
  DeleteClassRequest,
  DeleteClassResponse,
  EditClassRequest,
  EditClassResponse,
  GetAllClassesResponse,
  GetClassResponse,
} from "../types";
import { api } from "./client";

const endpoints = {
  getAll: "/class/getAll",
  create: "/class/create",
  get: "/class/get?classNumber={classNumber}",
  edit: "/class/edit",
  delete: "/class/delete",
};

const getAllClasses = () => {
  return api.get<GetAllClassesResponse>(endpoints.getAll);
};

const createClass = (payload: CreateClassRequest) => {
  return api.post<CreateClassResponse>(endpoints.create, payload);
};

const getClassDetails = (classNumber: string) => {
  return api.get<GetClassResponse>(
    endpoints.get.replace("{classNumber}", classNumber)
  );
};

const editClassDetails = (payload: EditClassRequest) => {
  return api.post<EditClassResponse>(endpoints.edit, payload);
};

const deleteClass = async (payload: DeleteClassRequest) => {
  const { data } = await api.post<DeleteClassResponse>(
    endpoints.delete,
    payload
  );
  return data;
};

export const classServices = {
  getAllClasses,
  createClass,
  getClassDetails,
  editClassDetails,
  deleteClass,
};
