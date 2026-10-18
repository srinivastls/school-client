import { api } from "./client";

export type ExamSubjectExamOption = {
  id: string; name: string; type: string; termNumber: number;
  startDate?: string; endDate?: string; isPublished?: boolean;
};
export type ExamSubjectClassOption = {
  id: string; classNumber: string; displayName: string; academicYearId: string;
};
export type ExamSubjectSubjectOption = {
  id: string; classId: string; name: string; code: string;
};
export type ExamSubjectRecord = {
  id: string; examId: string; subjectId: string; classId: string;
  maxMarks: number; passingMarks: number; weightage: number | null;
  exam: ExamSubjectExamOption & { academicYearId: string };
  class: ExamSubjectClassOption;
  subject: ExamSubjectSubjectOption;
};
export type ExamSubjectPayload = {
  examId: string; subjectId: string; classId: string;
  maxMarks: number; passingMarks: number; weightage?: number | null;
};

const getOptions = async (academicYearId: string) => {
  const response = await api.get("/principal-exam-subjects/options", { params: { academicYearId } });
  return { academicYear: response.data?.academicYear, exams: response.data?.exams ?? [] };
};
const getExamSubjects = async (params: { academicYearId: string; examId?: string; classId?: string }): Promise<ExamSubjectRecord[]> => {
  const response = await api.get("/principal-exam-subjects", { params });
  return response.data?.examSubjects ?? [];
};
const createExamSubject = async (payload: ExamSubjectPayload): Promise<ExamSubjectRecord> => {
  const response = await api.post("/principal-exam-subjects", payload);
  return response.data?.examSubject;
};
const updateExamSubject = async (id: string, payload: Partial<ExamSubjectPayload>): Promise<ExamSubjectRecord> => {
  const response = await api.put(`/principal-exam-subjects/${encodeURIComponent(id)}`, payload);
  return response.data?.examSubject;
};
const deleteExamSubject = async (id: string): Promise<void> => {
  await api.delete(`/principal-exam-subjects/${encodeURIComponent(id)}`);
};
export const principalExamSubjectServices = { getOptions, getExamSubjects, createExamSubject, updateExamSubject, deleteExamSubject };
export default principalExamSubjectServices;
