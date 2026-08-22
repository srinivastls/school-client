import {
  GetMonthOrDateReportRequest,
  GetMonthOrDateReportResponse,
  GetPercUnpaidStudentRequest,
  GetStudentMonthOrDateReportRequest,
} from "../types";
import { api } from "./client";

const endpoints = {
  GET_PERC_UNPAID_STUDENTS:
    "/report/getUnpaidPercStudents?classNumber={classNumber}&perc={perc}",
  GET_MONTH_OR_DATE_REPORT: "/report/getMonthOrDateReport",
  GET_STUDENT_MONTH_OR_DATE_REPORT: "/report/getStudentMonthOrDateReport",
};

const getPercUnpaidStudents = async ({
  classNumber,
  perc,
}: GetPercUnpaidStudentRequest) => {
  const { data } = await api.get(
    endpoints.GET_PERC_UNPAID_STUDENTS.replace(
      "{classNumber}",
      classNumber
    ).replace("{perc}", perc)
  );
  return data;
};

const getMonthOrDateReport = async (payload: GetMonthOrDateReportRequest) => {
  const { data } = await api.post<GetMonthOrDateReportResponse>(
    endpoints.GET_MONTH_OR_DATE_REPORT,
    payload
  );
  return data;
};

const getStudentMonthOrDateReport = async (
  payload: GetStudentMonthOrDateReportRequest
) => {
  const { data } = await api.post<GetMonthOrDateReportResponse>(
    endpoints.GET_STUDENT_MONTH_OR_DATE_REPORT,
    payload
  );
  return data;
};

export const reportServices = {
  getPercUnpaidStudents,
  getMonthOrDateReport,
  getStudentMonthOrDateReport,
};
