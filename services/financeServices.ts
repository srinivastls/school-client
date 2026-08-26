import { api } from "./client";

export type FinanceStudent = {
  id: string;
  admissionNo: string;
  name: string;

  phone?: string;

  classNumber?: string;
  sectionName?: string;

  pendingAmount: string | number;

  pendingTuitionFee: string | number;
  pendingTextbookFee: string | number;
  pendingNotebookFee: string | number;
  pendingDiaryAmount: string | number;

  tie: {
    amount: string | number;
    pendingAmount: string | number;
  };

  belt: {
    amount: string | number;
    pendingAmount: string | number;
  };

  arrears: {
    amount: string | number;
    pendingAmount: string | number;
  };
};

const getStudentForFeeCollection = async (
  admissionNo: string
): Promise<FinanceStudent> => {
  const response = await api.post(
    "/student/get",
    {
      admissionNo,
    }
  );

  return response.data;
};

export const financeServices = {
  getStudentForFeeCollection,
};