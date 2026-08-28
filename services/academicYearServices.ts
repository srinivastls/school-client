import {
  GetAcademicYearsResponse,
} from "../types";

import { api } from "./client";


/* ============================================================
   TYPES
============================================================ */

export type CreateAcademicYearRequest = {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
};


export type CreateAcademicYearResponse = {
  message: string;

  academicYear: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    createdAt: string;
    updatedAt: string;
  };
};


export type SetCurrentAcademicYearResponse = {
  message: string;

  academicYear: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    createdAt: string;
    updatedAt: string;
  };
};


export type PopulateAcademicYearRequest = {
  sourceAcademicYearId: string;
  targetAcademicYearId: string;
};


export type PopulateAcademicYearResponse = {
  message: string;

  sourceAcademicYear: {
    id: string;
    name: string;
  };

  targetAcademicYear: {
    id: string;
    name: string;
  };

  summary: {
    classesCreated: number;
    sectionsCreated: number;
    subjectsCreated: number;
  };
};


/* ============================================================
   ENDPOINTS
============================================================ */

const endpoints = {

  get:
    "/academic-year",

  current:
    "/academic-year/current",

  byId:
    "/academic-year/{academicYearId}",

  create:
    "/academic-year",

  setCurrent:
    "/academic-year/{academicYearId}/current",

  populate:
    "/api/academic-year/populate",

};


/* ============================================================
   GET ALL
============================================================ */

const getAcademicYears =
  async (): Promise<GetAcademicYearsResponse> => {

    const { data } =
      await api.get<GetAcademicYearsResponse>(
        endpoints.get
      );

    return data;

  };


/* ============================================================
   GET CURRENT
============================================================ */

const getCurrentAcademicYear =
  async () => {

    const { data } =
      await api.get(
        endpoints.current
      );

    return data;

  };


/* ============================================================
   GET BY ID
============================================================ */

const getAcademicYearById =
  async (
    academicYearId: string
  ) => {

    const { data } =
      await api.get(
        endpoints.byId.replace(
          "{academicYearId}",
          academicYearId
        )
      );

    return data;

  };


/* ============================================================
   CREATE
============================================================ */

const createAcademicYear =
  async (
    payload: CreateAcademicYearRequest
  ): Promise<CreateAcademicYearResponse> => {

    const { data } =
      await api.post<CreateAcademicYearResponse>(
        endpoints.create,
        payload
      );

    return data;

  };


/* ============================================================
   SET CURRENT
============================================================ */

const setCurrentAcademicYear =
  async (
    academicYearId: string
  ): Promise<SetCurrentAcademicYearResponse> => {

    const { data } =
      await api.patch<SetCurrentAcademicYearResponse>(

        endpoints.setCurrent.replace(
          "{academicYearId}",
          academicYearId
        )

      );

    return data;

  };


/* ============================================================
   POPULATE NEW ACADEMIC YEAR
============================================================ */

const populateAcademicYear =
  async (
    payload: PopulateAcademicYearRequest
  ): Promise<PopulateAcademicYearResponse> => {

    const { data } =
      await api.post<PopulateAcademicYearResponse>(
        endpoints.populate,
        payload
      );

    return data;

  };


/* ============================================================
   EXPORT
============================================================ */

export const academicYearServices = {

  getAcademicYears,

  getCurrentAcademicYear,

  getAcademicYearById,

  createAcademicYear,

  setCurrentAcademicYear,

  populateAcademicYear,

};