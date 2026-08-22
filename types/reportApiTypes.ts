import { CommonResponse } from "./commonApiTypes";
import { Transaction } from "./entityTypes";

export type GetPercUnpaidStudentRequest = { classNumber: string; perc: string };
export type GetPercUnpaidStudentResponse = {
  name: string;
  admissionNo: string;
}[] &
  CommonResponse;

export type GetMonthOrDateReportRequest = {
  classNumber: string;
  month?: string;
  date?: string;
  year: string;
};
export type GetMonthOrDateReportResponse = Transaction[] & CommonResponse;

export type GetStudentMonthOrDateReportRequest = {
  admissionNo: string;
  month?: string;
  date?: string;
  year: string;
};
export type GetStudentMonthOrDateReportResponse = Transaction[] &
  CommonResponse;
