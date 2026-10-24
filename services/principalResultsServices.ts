import { api } from "./client";

export type PrincipalResultsExam = {
  id: string; name: string; type: string; termNumber: number;
  startDate: string; endDate: string; isPublished: boolean;
  classCount: number; subjectAssignmentCount: number;
  totalMarksRecords: number; finalizedMarksCount: number; pendingMarksCount: number;
  classes: Array<{ id: string; classNumber: string; displayName: string }>;
};

const getOptions = async (academicYearId: string): Promise<PrincipalResultsExam[]> => {
  const response = await api.get("/principal-results", { params: { academicYearId } });
  return response.data?.exams ?? [];
};

const getExamResults = async (academicYearId: string, examId: string) => {
  const response = await api.get(`/principal-results/${encodeURIComponent(examId)}`, { params: { academicYearId } });
  return response.data;
};

const setPublished = async (academicYearId: string, examId: string, isPublished: boolean) => {
  const response = await api.patch(`/principal-results/${encodeURIComponent(examId)}/publish`, { academicYearId, isPublished });
  return response.data;
};

export const principalResultsServices = { getOptions, getExamResults, setPublished };
export default principalResultsServices;
