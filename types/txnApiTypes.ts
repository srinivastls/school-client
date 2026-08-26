import { CommonResponse } from "./commonApiTypes";
import { Transaction } from "./entityTypes";

// export type RecordTxnRequest = Omit<
//   Transaction,
//   "pendingAmount" | "classNumber" | "student" | "id"
// > & { studentAdmissionNo: string };

//export type RecordTxnResponse = Transaction & CommonResponse;

export type StudentTxnsRequest = { admissionNo: string };
export type StudentTxnsResponse = CommonResponse & Transaction[];

export type GetTotalTxnAmountRequest = { dates: string[] };
export type GetTotalTxnAmountResponse = CommonResponse & number;

export type RecordTxnResponse = {
  id: string;

  amount: string;

  paymentMode:
    | "CASH"
    | "WALLET"
    | "ONLINE";

  date: string;

  student: string;

  transactionId?: string;

  receiptNumber: string;

  recordedByUserId: string;

  classNumber: string;

  pendingAmount: string;

  amountDetails: {
    tie: string;
    diary: string;
    belt: string;
    arrears: string;
    tuitionFee: string;
    textBookFee: string;
    noteBookFee: string;
  };
};

export type RecordTxnRequest = {
  amount: number;

  paymentMode:
    | "CASH"
    | "WALLET"
    | "ONLINE";

  date: string;

  studentAdmissionNo: string;

  amountDetails: {
    tuitionFee: number;
    textBookFee: number;
    noteBookFee: number;
    diary: number;
    tie: number;
    belt: number;
    arrears: number;
  };

  transactionId?: string;
};