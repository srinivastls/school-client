import {
  GetMonthOrDateReportRequest,
  GetMonthOrDateReportResponse,
  GetPercUnpaidStudentRequest,
  GetStudentMonthOrDateReportRequest,
} from "../types";

import { api } from "./client";

/* ============================================================
   PENDING DUES TYPES
============================================================ */

export type PendingDuesStudent = {
  id: string;

  admissionNo: string;

  name: string;

  classNumber: string;

  sectionName: string;

  totalFee: number;

  unpaidPercentage: number;

  pendingAmount: number;

  pendingTuitionFee: number;

  pendingTextbookFee: number;

  pendingNotebookFee: number;

  pendingDiaryAmount: number;

  tie: {
    amount: number;
    pendingAmount: number;
  };

  belt: {
    amount: number;
    pendingAmount: number;
  };

  arrears: {
    amount: number;
    pendingAmount: number;
  };
};


export type PendingDuesClassSummary = {
  classNumber: string;

  studentCount: number;

  pendingAmount: number;
};


export type PendingDuesResponse = {
  filters: {
    classNumber: string | null;

    percentage: number;
  };

  summary: {
    totalStudents: number;

    totalPendingAmount: number;

    totalPayableAmount: number;

    totalClasses: number;
  };

  classSummary: PendingDuesClassSummary[];

  students: PendingDuesStudent[];
};


/* ============================================================
   ENDPOINTS
============================================================ */

const endpoints = {

  GET_PERC_UNPAID_STUDENTS:
    "/report/getUnpaidPercStudents?classNumber={classNumber}&perc={perc}",

  GET_PENDING_DUES:
    "/report/getPendingDues",

  GET_MONTH_OR_DATE_REPORT:
    "/report/getMonthOrDateReport",

  GET_STUDENT_MONTH_OR_DATE_REPORT:
    "/report/getStudentMonthOrDateReport",
};


/* ============================================================
   PERCENTAGE UNPAID
============================================================ */

const getPercUnpaidStudents = async ({
  classNumber,
  perc,
}: GetPercUnpaidStudentRequest) => {

  const { data } =
    await api.get(
      endpoints.GET_PERC_UNPAID_STUDENTS
        .replace(
          "{classNumber}",
          classNumber
        )
        .replace(
          "{perc}",
          perc
        )
    );

  return data;
};


/* ============================================================
   PENDING DUES
============================================================ */

const getPendingDues = async ({
  classNumber,
  perc,
}: {
  classNumber?: string | null;

  perc: string;
}): Promise<PendingDuesResponse> => {

  const params = new URLSearchParams();

  params.append(
    "perc",
    perc
  );

  if (
    classNumber &&
    classNumber !== "ALL"
  ) {

    params.append(
      "classNumber",
      classNumber
    );

  }

  const { data } =
    await api.get(
      `${endpoints.GET_PENDING_DUES}?${params.toString()}`
    );

  return data;
};


/* ============================================================
   MONTH / DATE
============================================================ */

const getMonthOrDateReport = async (
  payload: GetMonthOrDateReportRequest
) => {

  const { data } =
    await api.post<GetMonthOrDateReportResponse>(
      endpoints.GET_MONTH_OR_DATE_REPORT,
      payload
    );

  return data;
};


/* ============================================================
   STUDENT MONTH / DATE
============================================================ */

const getStudentMonthOrDateReport = async (
  payload: GetStudentMonthOrDateReportRequest
) => {

  const { data } =
    await api.post<GetMonthOrDateReportResponse>(
      endpoints.GET_STUDENT_MONTH_OR_DATE_REPORT,
      payload
    );

  return data;
};


/* ============================================================
   EXPORT
============================================================ */

export const reportServices = {

  getPercUnpaidStudents,

  getPendingDues,

  getMonthOrDateReport,

  getStudentMonthOrDateReport,

};