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


  export type PendingDueStudent = {
  id: string;

  admissionNo: string;

  name: string;

  classNumber?: string;

  sectionName?: string;

  pendingAmount:
    | string
    | number;

  pendingTuitionFee:
    | string
    | number;

  pendingTextbookFee:
    | string
    | number;

  pendingNotebookFee:
    | string
    | number;

  pendingDiaryAmount:
    | string
    | number;

  tie: {
    pendingAmount:
      | string
      | number;
  };

  belt: {
    pendingAmount:
      | string
      | number;
  };

  arrears: {
    pendingAmount:
      | string
      | number;
  };
};

export type PendingDuesStudent = {
  id: string;

  admissionNo: string;

  name: string;

  phone?: string;

  classNumber?: string;

  sectionName?: string;

  pendingAmount: number;

  pendingTuitionFee: number;

  pendingTextbookFee: number;

  pendingNotebookFee: number;

  pendingDiaryAmount: number;

  tie: {
    pendingAmount: number;
  };

  belt: {
    pendingAmount: number;
  };

  arrears: {
    pendingAmount: number;
  };

  totalFee: number;

  unpaidPercentage: number;
};

export type PendingDuesClassSummary = {
  classNumber: string;

  totalStudents: number;

  totalPendingAmount: number;
};

export type GetPendingDuesResponse = {
  percentage: number;

  classNumber: string;

  totalStudents: number;

  totalPendingAmount: number;

  classSummary: PendingDuesClassSummary[];

  students: PendingDuesStudent[];
};

export type PendingDuesResponse = {
  totalStudents: number;

  totalPendingAmount:
    | string
    | number;

  students:
    PendingDueStudent[];
};