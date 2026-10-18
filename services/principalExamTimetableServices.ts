import { api } from "./client";

export type ExamTimetableExamOption = {
  id: string; name: string; type: string; termNumber: number;
  startDate: string; endDate: string; isPublished: boolean;
};
export type ExamTimetableClassOption = {
  id: string; classNumber: string; displayName: string; academicYearId: string;
};
export type ExamTimetableSubjectOption = {
  id: string; classId: string; name: string; code: string;
};
export type ExamTimetableEntry = {
  id: string; schoolId: string; examId: string; classId: string; subjectId: string;
  examDate: string; startTime: string | null; endTime: string | null;
  exam: ExamTimetableExamOption & { academicYearId: string };
  class: ExamTimetableClassOption;
  subject: ExamTimetableSubjectOption;
};
export type ExamTimetablePayload = {
  examId: string; classId: string; subjectId: string;
  examDate: string; startTime?: string | null; endTime?: string | null;
};

const getOptions = async (academicYearId: string) => {
  const response = await api.get("/principal-exam-timetable/options", { params: { academicYearId } });
  return { academicYear: response.data?.academicYear, exams: response.data?.exams ?? [] };
};
const getEntries = async (params: { academicYearId: string; examId?: string; classId?: string }): Promise<ExamTimetableEntry[]> => {
  const response = await api.get("/principal-exam-timetable", { params });
  return response.data?.entries ?? [];
};
const createEntry = async (payload: ExamTimetablePayload): Promise<ExamTimetableEntry> => {
  const response = await api.post("/principal-exam-timetable", payload);
  return response.data?.entry;
};
const updateEntry = async (id: string, payload: Partial<ExamTimetablePayload>): Promise<ExamTimetableEntry> => {
  const response = await api.put(`/principal-exam-timetable/${encodeURIComponent(id)}`, payload);
  return response.data?.entry;
};
const deleteEntry = async (id: string): Promise<void> => {
  await api.delete(`/principal-exam-timetable/${encodeURIComponent(id)}`);
};
export const principalExamTimetableServices = { getOptions, getEntries, createEntry, updateEntry, deleteEntry };
export default principalExamTimetableServices;
