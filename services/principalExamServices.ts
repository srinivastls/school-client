import { api } from "./client";

export type ExamAcademicYear = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

export type ExamRecord = {
  id: string;
  schoolId: string;
  academicYearId: string;
  name: string;
  type: string;
  termNumber: number;
  startDate: string;
  endDate: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ExamPayload = {
  academicYearId: string;
  name: string;
  type: string;
  termNumber: number;
  startDate: string;
  endDate: string;
};

export type ExamUpdatePayload = Partial<Omit<ExamPayload, "academicYearId">>;

const getOptions = async (academicYearId: string): Promise<{
  academicYear: ExamAcademicYear;
  examTypes: string[];
}> => {
  const response = await api.get("/principal-exams/options", {
    params: { academicYearId },
  });
  return {
    academicYear: response.data?.academicYear,
    examTypes: response.data?.examTypes ?? [],
  };
};

const getExams = async (academicYearId: string): Promise<ExamRecord[]> => {
  const response = await api.get("/principal-exams", {
    params: { academicYearId },
  });
  return response.data?.exams ?? [];
};

const createExam = async (payload: ExamPayload): Promise<ExamRecord> => {
  const response = await api.post("/principal-exams", payload);
  return response.data?.exam;
};

const updateExam = async (
  examId: string,
  payload: ExamUpdatePayload,
): Promise<ExamRecord> => {
  const response = await api.put(
    `/principal-exams/${encodeURIComponent(examId)}`,
    payload,
  );
  return response.data?.exam;
};

const setPublished = async (
  examId: string,
  isPublished: boolean,
): Promise<ExamRecord> => {
  const response = await api.patch(
    `/principal-exams/${encodeURIComponent(examId)}/publish`,
    { isPublished },
  );
  return response.data?.exam;
};

const deleteExam = async (examId: string): Promise<void> => {
  await api.delete(`/principal-exams/${encodeURIComponent(examId)}`);
};

export const principalExamServices = {
  getOptions,
  getExams,
  createExam,
  updateExam,
  setPublished,
  deleteExam,
};

export default principalExamServices;
