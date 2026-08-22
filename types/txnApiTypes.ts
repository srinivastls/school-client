import { CommonResponse } from "./commonApiTypes";
import { Transaction } from "./entityTypes";

export type RecordTxnRequest = Omit<
  Transaction,
  "pendingAmount" | "classNumber" | "student" | "id"
> & { studentAdmissionNo: string };

export type RecordTxnResponse = Transaction & CommonResponse;

export type StudentTxnsRequest = { admissionNo: string };
export type StudentTxnsResponse = CommonResponse & Transaction[];

export type GetTotalTxnAmountRequest = { dates: string[] };
export type GetTotalTxnAmountResponse = CommonResponse & number;
