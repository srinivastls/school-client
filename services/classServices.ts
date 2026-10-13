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

/* ============================================================
   TYPES
============================================================ */

export type CopyClassesRequest = {
  fromAcademicYearId: string;
  toAcademicYearId: string;
};

export type CopyClassesResponse = {
  message: string;

  fromAcademicYearId: string;

  toAcademicYearId: string;

  createdCount: number;

  skippedCount: number;

  classes: {
    id: string;
    classNumber: string;
    displayName: string;

    tuitionFee: string;
    textBookFee: string;
    noteBookFee: string;
    diaryFee: string;

    academicYearId: string;
    isCompleted: boolean;
  }[];

  skipped: {
    classNumber: string;
    displayName: string;
    reason: string;
  }[];
};

/* ============================================================
   ENDPOINTS
============================================================ */

const endpoints = {
  getAll:
    "/class/getAll",

  create:
    "/class/create",

  get:
    "/class/get",

  edit:
    "/class/edit",

  delete:
    "/class/delete",

  copyAcademicYear:
    "/class/copy-academic-year",
};

/* ============================================================
   GET ALL CLASSES
============================================================ */

const getAllClasses = (academicYearId: string) =>
  async (): Promise<GetAllClassesResponse> => {

    const { data } =
      await api.get<GetAllClassesResponse>(
        endpoints.getAll,{
          params: {
            academicYearId,
          }
        }
      );

    return data;
  };

/* ============================================================
   GET CLASSES BY ACADEMIC YEAR
============================================================ */

const getClassesByAcademicYear =
  async (
    academicYearId: string
  ): Promise<GetAllClassesResponse> => {

    const { data } =
      await api.get<GetAllClassesResponse>(
        endpoints.getAll,
        {
          params: {
            academicYearId,
          },
        }
      );

    return data;
  };

/* ============================================================
   CREATE CLASS
============================================================ */

const createClass =
  async (
    payload: CreateClassRequest
  ): Promise<CreateClassResponse> => {

    const { data } =
      await api.post<CreateClassResponse>(
        endpoints.create,
        payload
      );

    return data;
  };

/* ============================================================
   GET CLASS DETAILS
============================================================ */

const getClassDetails =
  async (
    classNumber: string,
    academicYearId?: string
  ): Promise<GetClassResponse> => {

    const { data } =
      await api.get<GetClassResponse>(
        endpoints.get,
        {
          params: {
            classNumber,

            ...(academicYearId
              ? {
                  academicYearId,
                }
              : {}),
          },
        }
      );

    return data;
  };

/* ============================================================
   EDIT CLASS
============================================================ */

const editClassDetails =
  async (
    payload: EditClassRequest
  ): Promise<EditClassResponse> => {

    const { data } =
      await api.post<EditClassResponse>(
        endpoints.edit,
        payload
      );

    return data;
  };

/* ============================================================
   DELETE CLASS
============================================================ */

const deleteClass =
  async (
    payload: DeleteClassRequest
  ): Promise<DeleteClassResponse> => {

    const { data } =
      await api.post<DeleteClassResponse>(
        endpoints.delete,
        payload
      );

    return data;
  };

/* ============================================================
   COPY CLASSES TO NEW ACADEMIC YEAR
============================================================ */

const copyClassesToAcademicYear =
  async (
    payload: CopyClassesRequest
  ): Promise<CopyClassesResponse> => {

    const { data } =
      await api.post<CopyClassesResponse>(
        endpoints.copyAcademicYear,
        payload
      );

    return data;
  };

/* ============================================================
   EXPORT
============================================================ */

export const classServices = {
  getAllClasses,

  getClassesByAcademicYear,

  createClass,

  getClassDetails,

  editClassDetails,

  deleteClass,

  copyClassesToAcademicYear,
};

