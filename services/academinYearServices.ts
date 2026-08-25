import {
  GetAcademicYearsResponse,
} from "../types";

import { api } from "./client";

const endpoints = {
  get: "/academic-year",
};

const getAcademicYears = async () => {
  const { data } =
    await api.get<GetAcademicYearsResponse>(
      endpoints.get
    );

  return data;
};

export const academicYearServices = {
  getAcademicYears,
};