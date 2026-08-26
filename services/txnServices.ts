import { api } from "./client";

import {
  RecordTxnRequest,
  RecordTxnResponse,
  StudentTxnsRequest,
  StudentTxnsResponse,
  GetTotalTxnAmountRequest,
  GetTotalTxnAmountResponse,
} from "../types";

/* ============================================================
   ENDPOINTS
============================================================ */

const endpoints = {
  recordTxn: "/txn/record",
  studentTxns: "/txn/getByStudent",
  totalTxnAmount: "/txn/getTotalTxnAmount",
};

/* ============================================================
   RECORD TRANSACTION
============================================================ */

const recordTxn = async (
  payload: RecordTxnRequest
): Promise<RecordTxnResponse> => {
  const response =
    await api.post<RecordTxnResponse>(
      endpoints.recordTxn,
      payload
    );

  return response.data;
};

/* ============================================================
   GET STUDENT TRANSACTIONS
============================================================ */

const getStudentTxns = async (
  payload: StudentTxnsRequest
): Promise<StudentTxnsResponse> => {
  const response =
    await api.post<StudentTxnsResponse>(
      endpoints.studentTxns,
      payload
    );

  return response.data;
};

/* ============================================================
   GET TOTAL TRANSACTION AMOUNT
============================================================ */

const getTotalTxnAmount = async (
  payload: GetTotalTxnAmountRequest
): Promise<GetTotalTxnAmountResponse> => {
  const response =
    await api.post<GetTotalTxnAmountResponse>(
      endpoints.totalTxnAmount,
      payload
    );

  return response.data;
};

/* ============================================================
   EXPORT
============================================================ */

export const txnServices = {
  recordTxn,
  getStudentTxns,
  getTotalTxnAmount,
};