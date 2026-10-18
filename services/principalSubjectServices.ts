import { api } from "./client";

export type SubjectClassOption = {
  id: string;
  classNumber: string;
  displayName: string;
};

export type SubjectRecord = {
  id: string;
  schoolId: string;
  classId: string;
  name: string;
  code: string;
  isOptional: boolean;
  class: SubjectClassOption & { academicYearId: string };
};

export type SubjectPayload = {
  classId: string;
  name: string;
  code: string;
  isOptional?: boolean;
};

const getClasses = async (academicYearId: string): Promise<SubjectClassOption[]> => {
  const response = await api.get("/subjects/classes", { params: { academicYearId } });
  return response.data?.classes ?? [];
};

const getSubjects = async (params?: {
  academicYearId?: string;
  classId?: string;
}): Promise<SubjectRecord[]> => {
  const response = await api.get("/subjects", { params });
  return response.data?.subjects ?? [];
};

const createSubject = async (payload: SubjectPayload): Promise<SubjectRecord> => {
  const response = await api.post("/subjects", payload);
  return response.data?.subject;
};

const updateSubject = async (
  subjectId: string,
  payload: Partial<SubjectPayload>,
): Promise<SubjectRecord> => {
  const response = await api.put(`/subjects/${encodeURIComponent(subjectId)}`, payload);
  return response.data?.subject;
};

const deleteSubject = async (subjectId: string): Promise<void> => {
  await api.delete(`/subjects/${encodeURIComponent(subjectId)}`);
};

export const principalSubjectServices = {
  getClasses,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
};

export default principalSubjectServices;
