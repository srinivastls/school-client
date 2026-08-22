import {
  GetTotalTxnAmountRequest,
  GetTotalTxnAmountResponse,
  RecordTxnRequest,
  RecordTxnResponse,
  StudentTxnsRequest,
  StudentTxnsResponse,
} from "../types";
import { api } from "./client";

const endpoints = {
  record: "/txn/record",
  getByStudent: "/txn/getByStudent",
  getTotalTxnAmount: "/txn/getTotalTxnAmount",
};

const recordTxn = async (payload: RecordTxnRequest) => {
  const { data } = await api.post<RecordTxnResponse>(endpoints.record, payload);
  return data;
};

const getStudentTxns = async (payload: StudentTxnsRequest) => {
  const { data } = await api.post<StudentTxnsResponse>(
    endpoints.getByStudent,
    payload
  );
  return data;
};

const getTotalTxnAmount = async (payload: GetTotalTxnAmountRequest) => {
  const { data } = await api.post<GetTotalTxnAmountResponse>(
    endpoints.getTotalTxnAmount,
    payload
  );
  return data;
};

export const txnServices = { recordTxn, getStudentTxns, getTotalTxnAmount };
