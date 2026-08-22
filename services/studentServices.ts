import {
  ClassStudentCountsResponse,
  CreateStudentFormFields,
  CreateStudentRequest,
  CreateStudentResponse,
  EditStudentRequest,
  EditStudentResponse,
  GetStudentByCouponRequest,
  GetStudentRequest,
  GetStudentResponse,
  PromoteDemoteRequest,
  PromoteDemoteResponse,
} from "../types";
import { api } from "./client";

const endpoints = {
  get: "/student/get",
  create: "/student/create",
  getByCoupon: "/student/getByCoupon",
  edit: "/student/edit",
  classCounts: "/student/classCounts",
  promoteDemote: "/student/promoteDemote",
};

const getStudentById = async (payload: GetStudentRequest) => {
  const { data } = await api.post<GetStudentResponse>(endpoints.get, payload);
  return data;
};

const createStudent = async (payload: CreateStudentFormFields) => {
  const reqPayload: CreateStudentRequest = {
    ...payload,
    tie: { amount: payload.tie, pendingAmount: payload.tie },
    diary: { amount: payload.diary, pendingAmount: payload.diary },
    belt: { amount: payload.belt, pendingAmount: payload.belt },
    arrears: { amount: payload.arrears, pendingAmount: payload.arrears },
  };
  const { data } = await api.post<CreateStudentResponse>(
    endpoints.create,
    reqPayload
  );
  return data;
};

const getStudentByCoupon = async (payload: GetStudentByCouponRequest) => {
  const { data } = await api.post<GetStudentResponse>(
    endpoints.getByCoupon,
    payload
  );
  return data;
};

const editStudent = async (payload: EditStudentRequest) => {
  const { data } = await api.post<EditStudentResponse>(endpoints.edit, payload);
  return data;
};

const getClassStudentCounts = async () => {
  const { data } = await api.get<ClassStudentCountsResponse>(
    endpoints.classCounts
  );
  return data;
};

const promoteDemote = async (payload: PromoteDemoteRequest) => {
  const { data } = await api.post<PromoteDemoteResponse>(
    endpoints.promoteDemote,
    payload
  );
  return data;
};

export const studentServices = {
  getStudentById,
  createStudent,
  getStudentByCoupon,
  editStudent,
  getClassStudentCounts,
  promoteDemote,
};
