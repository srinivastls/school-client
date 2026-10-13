import { api } from "./client";

/* ============================================================
   TYPES
============================================================ */

export type SectionTeacher = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  employeeId?: string | null;
  designation?: string | null;
  role?: string;
};

export type Section = {
  id: string;
  sectionName: string;
  classId: string;

  classTeacher?: SectionTeacher | null;

  totalStudents?: number;
};

export type ClassWithSections = {
  id: string;
  classNumber: string;
  displayName: string;
  academicYearId: string;
};

export type GetSectionsByClassResponse = {
  class: ClassWithSections;
  sections: Section[];
};

/* ============================================================
   COPY SECTIONS
============================================================ */

export type CopySectionsRequest = {
  fromAcademicYearId: string;
  toAcademicYearId: string;
};

export type CopiedSection = {
  id: string;
  classId: string;
  sectionName: string;
};

export type SkippedSection = {
  classNumber: string;
  sectionName: string;
};

export type CopySectionsResponse = {
  message: string;

  fromAcademicYearId: string;

  toAcademicYearId: string;

  createdCount: number;

  skippedCount: number;

  sections: CopiedSection[];

  skipped: SkippedSection[];
};

/* ============================================================
   ASSIGN CLASS TEACHER
============================================================ */

export type AssignClassTeacherRequest = {
  sectionId: string;
  teacherUserId: string;
};

export type AssignedSection = {
  id: string;
  sectionName: string;
  classId: string;

  classTeacher?: SectionTeacher | null;
};

export type AssignClassTeacherResponse = {
  message: string;
  section: AssignedSection;
};

/* ============================================================
   REMOVE CLASS TEACHER
============================================================ */

export type RemoveClassTeacherRequest = {
  sectionId: string;
};

export type RemoveClassTeacherResponse = {
  message: string;
  section: AssignedSection;
};

export type ClassTeacherAssignmentSection =
  Section & {
    class: ClassWithSections;
  };

export type GetClassTeacherAssignmentsResponse = {
  totalSections: number;
  assigned: number;
  unassigned: number;
  sections: ClassTeacherAssignmentSection[];
};


export type CreateSectionRequest = {
  classId: string;
  sectionName: string;
};

export type CreateSectionResponse = {
  message: string;

  section: {
    id: string;
    sectionName: string;
    classId: string;

    classTeacher: {
      id: string;
      name: string;
      email?: string;
      employeeId?: string;
      designation?: string;
      role?: string;
    } | null;

    totalStudents: number;
  };
};

/* ============================================================
   AVAILABLE CLASS TEACHERS
============================================================ */

export type AvailableClassTeacher = {
  id: string;
  name: string;

  email?: string | null;

  phone?: string | null;

  employeeId?: string | null;

  designation?: string | null;

  department?: string | null;

  role: string;

  assignedSections: number;
};

export type GetAvailableClassTeachersResponse = {
  teachers: AvailableClassTeacher[];
};

/* ============================================================
   ENDPOINTS
============================================================ */

const endpoints = {
  getByClass:
    "/section/class",

  copy:
    "/section/copy",

  assignTeacher:
    "/class-teacher/assign",

  removeTeacher:
    "/section/remove-class-teacher",

  availableTeachers:
    "/section/available-teachers",

  createSection:
    "/section/create",

  deleteSection:
    "/section/delete",

  getStudentsBySection:
    "/section/students",

  getClassTeacherAssignments:
    "/class-teacher",
};

/* ============================================================
   GET SECTIONS BY CLASS
============================================================ */

const getSectionsByClass = async (
  classId: string
): Promise<GetSectionsByClassResponse> => {

  const { data } =
    await api.get<GetSectionsByClassResponse>(
      endpoints.getByClass,
      {
        params: {
          classId,
        },
      }
    );

  return data;
};


const getClassTeacherAssignments = async (
  academicYearId: string
): Promise<GetClassTeacherAssignmentsResponse> => {

  const { data } =
    await api.get<GetClassTeacherAssignmentsResponse>(
      endpoints.getClassTeacherAssignments,
      {
        params: {
          academicYearId,
        },
      }
    );

  return data;
};

/* ============================================================
   COPY SECTIONS TO NEW ACADEMIC YEAR
============================================================ */

const copySectionsToAcademicYear = async (
  payload: CopySectionsRequest
): Promise<CopySectionsResponse> => {

  const { data } =
    await api.post<CopySectionsResponse>(
      endpoints.copy,
      payload
    );

  return data;
};

/* ============================================================
   ASSIGN CLASS TEACHER
============================================================ */

const assignClassTeacher = async (
  payload: AssignClassTeacherRequest
): Promise<AssignClassTeacherResponse> => {

  const { data } =
    await api.post<AssignClassTeacherResponse>(
      endpoints.assignTeacher,
      payload
    );

  return data;
};


const createSection = async (
  payload: CreateSectionRequest
): Promise<CreateSectionResponse> => {

  const { data } =
    await api.post<CreateSectionResponse>(
      endpoints.createSection,
      payload
    );

  return data;
};


const deleteSection = async (
  sectionId: string
): Promise<{ message: string }> => {
  const { data } =
    await api.delete<{ message: string }>(
      endpoints.deleteSection,
      {
        params: {
          sectionId,
        },
      }
    );

  return data;
};

/* ============================================================
   REMOVE CLASS TEACHER
============================================================ */

const removeClassTeacher = async (
  payload: RemoveClassTeacherRequest
): Promise<RemoveClassTeacherResponse> => {
  const { data } =
    await api.delete<RemoveClassTeacherResponse>(
      endpoints.removeTeacher,
      {
        data: payload,
      }
    );

  return data;
};

/* ============================================================
   GET AVAILABLE CLASS TEACHERS
============================================================ */

const getAvailableClassTeachers =
  async (): Promise<GetAvailableClassTeachersResponse> => {

    const { data } =
      await api.get<GetAvailableClassTeachersResponse>(
        endpoints.availableTeachers
      );

    return data;
  };


  export type GetStudentsBySectionResponse = {
  section: {
    id: string;
    sectionName: string;
    classId: string;
    class?: {
      id: string;
      classNumber: string;
      displayName?: string;
      academicYearId?: string;
    };
  };

  students: {
    id?: string;
    admissionNo: string;
    name: string;
  }[];

  totalStudents?: number;
};



const getStudentsBySection = async (
  sectionId: string
): Promise<GetStudentsBySectionResponse> => {

  const { data } =
    await api.get<GetStudentsBySectionResponse>(
      endpoints.getStudentsBySection,
      {
        params: {
          sectionId,
        },
      }
    );

  return data;
};

/* ============================================================
   EXPORT
============================================================ */

export const sectionServices = {
  getStudentsBySection,
  getSectionsByClass,
  
  createSection,

  deleteSection,

  copySectionsToAcademicYear,

  assignClassTeacher,

  removeClassTeacher,

  getAvailableClassTeachers,

  getClassTeacherAssignments,

};