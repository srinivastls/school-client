import {api} from './client';

/**
 * Principal Teacher–Subject Mapping API service.
 *
 * Matches the backend controller/routes shared in the project context:
 * - GET    /teacher-subject/teachers
 * - GET    /teacher-subject/options?academicYearId=...
 * - GET    /teacher-subject?academicYearId=...
 * - POST   /teacher-subject
 * - DELETE /teacher-subject/:mappingId
 *
 * Academic-year list endpoint is not present in the supplied mapping controller.
 * getAcademicYears() below uses GET /academic-years as a common convention; change
 * that path if your project mounts the academic-year endpoint differently.
 */

export type MappingTeacher = {
  id: string;
  name: string;
  email?: string;
  employeeId?: string | null;
  designation?: string | null;
  department?: string | null;
};

export type MappingSubject = {
  id: string;
  name: string;
  code?: string | null;
  isOptional?: boolean;
};

export type MappingSection = {
  id: string;
  sectionName: string;
};

export type MappingClass = {
  id: string;
  classNumber: string | number;
  displayName?: string | null;
  subjects: MappingSubject[];
  sections: MappingSection[];
};

export type MappingOptionsResponse = {
  academicYearId: string;
  classes: MappingClass[];
};

export type TeacherSubjectMapping = {
  id: string;
  teacherUserId?: string;
  subjectId?: string;
  sectionId?: string;
  academicYearId?: string;
  teacher: MappingTeacher;
  subject: MappingSubject & {
    class?: {
      id: string;
      classNumber?: string | number;
      displayName?: string | null;
    };
  };
  section: MappingSection & {
    class?: {
      id: string;
      classNumber?: string | number;
      displayName?: string | null;
    };
  };
  academicYear?: {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
  };
};

export type AcademicYearOption = {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
};

export type AssignTeacherSubjectPayload = {
  teacherUserId: string;
  subjectId: string;
  sectionId: string;
  academicYearId: string;
};

const getTeachersForMapping = async (): Promise<MappingTeacher[]> => {
  const response = await api.get('/teacher-subject/teachers');
  return response.data?.teachers ?? response.data?.data ?? [];
};

const getAcademicYears = async (): Promise<AcademicYearOption[]> => {
  const response = await api.get('/academic-year');
  return response.data?.academicYears ?? response.data?.years ?? response.data?.data ?? [];
};

const getSubjectsForMapping = async (
  academicYearId: string,
): Promise<MappingOptionsResponse> => {
  const response = await api.get('/teacher-subject/options', {
    params: { academicYearId },
  });
  return response.data;
};

const getMappings = async (
  academicYearId: string,
): Promise<TeacherSubjectMapping[]> => {
  const response = await api.get('/teacher-subject', {
    params: { academicYearId },
  });
  return response.data?.mappings ?? response.data?.data ?? [];
};

const assignTeacherSubject = async (
  payload: AssignTeacherSubjectPayload,
): Promise<TeacherSubjectMapping> => {
  const response = await api.post('/teacher-subject', payload);
  return response.data?.mapping ?? response.data?.data ?? response.data;
};

const deleteMapping = async (mappingId: string): Promise<{ message?: string }> => {
  const response = await api.delete(`/teacher-subject/${encodeURIComponent(mappingId)}`);
  return response.data;
};

export const teacherSubjectMappingServices = {
  getTeachersForMapping,
  getAcademicYears,
  getSubjectsForMapping,
  getMappings,
  assignTeacherSubject,
  deleteMapping,
};

export default teacherSubjectMappingServices;
