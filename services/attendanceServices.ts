import { api } from "./client";

/* ============================================================
   TYPES
============================================================ */

export type StudentAttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "HALF_DAY"
  | "HOLIDAY";

/* ============================================================
   STUDENT
============================================================ */

export type AttendanceStudent = {
  id: string;
  admissionNo: string;
  name: string;
  rollNumber?: string | null;

  classId: string;
  sectionId: string;

  attendance?: {
    id?: string;
    status: StudentAttendanceStatus;
    remark?: string | null;
  } | null;
};

/* ============================================================
   DASHBOARD
============================================================ */

export type StudentAttendanceSummary = {
  total: number;
  marked: number;
  unmarked: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  holiday: number;
};

export type TeacherAttendanceSummary = {
  total: number;
  marked: number;
  unmarked: number;
  present: number;
  absent: number;
  halfDay: number;
  onLeave: number;
};

export type ClassAttendanceSummary = {
  classId: string;
  classNumber: string;
  displayName: string;
  totalStudents: number;
  marked: number;
  unmarked: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  holiday: number;
  attendancePercentage: number;
};

export type SectionAttendanceSummary = {
  sectionId: string;
  classId: string;
  classNumber: string;
  classDisplayName: string;
  sectionName: string;
  totalStudents: number;
  marked: number;
  unmarked: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  holiday: number;
  attendancePercentage: number;
};

export type AttendanceDashboardResponse = {
  date: string;

  students: {
    summary: StudentAttendanceSummary;
    attendancePercentage: number;
    absentPercentage: number;
    classWise: ClassAttendanceSummary[];
    sectionWise: SectionAttendanceSummary[];
  };

  teachers: {
    summary: TeacherAttendanceSummary;
    attendancePercentage: number;
    absentPercentage: number;
  };
};

/* ============================================================
   GET DASHBOARD
============================================================ */

const getAttendanceDashboard = async (
  date: string
): Promise<AttendanceDashboardResponse> => {
  const { data } =
    await api.get<AttendanceDashboardResponse>(
      "/attendance/dashboard",
      {
        params: {
          date,
        },
      }
    );

  return data;
};

/* ============================================================
   GET STUDENTS FOR ATTENDANCE
============================================================ */

export type GetStudentsForAttendanceRequest = {
  classId: string;
  sectionId: string;
  academicYearId: string;
  date: string;
};

export type GetStudentsForAttendanceResponse = {
  date: string;
  classId: string;
  sectionId: string;
  academicYearId: string;
  students: AttendanceStudent[];
};

const getStudentsForAttendance = async ({
  classId,
  sectionId,
  academicYearId,
  date,
}: GetStudentsForAttendanceRequest): Promise<GetStudentsForAttendanceResponse> => {
  const { data } =
    await api.get<GetStudentsForAttendanceResponse>(
      "/student/attendance",
      {
        params: {
          classId,
          sectionId,
          academicYearId,
          date,
        },
      }
    );

  return data;
};

/* ============================================================
   MARK STUDENT ATTENDANCE
============================================================ */

export type StudentAttendanceItem = {
  studentId: string;
  status: StudentAttendanceStatus;
  remark?: string;
};

export type MarkStudentAttendanceRequest = {
  classId: string;
  sectionId: string;
  academicYearId: string;
  date: string;
  attendance: StudentAttendanceItem[];
};

export type MarkStudentAttendanceResponse = {
  message: string;
  date: string;
  count: number;
  attendance: any[];
};

const markStudentAttendance = async (
  payload: MarkStudentAttendanceRequest
): Promise<MarkStudentAttendanceResponse> => {
  const { data } =
    await api.post<MarkStudentAttendanceResponse>(
      "/student/mark",
      payload
    );

  return data;
};

/* ============================================================
   EXPORT
============================================================ */

export const attendanceServices = {
  getAttendanceDashboard,
  getStudentsForAttendance,
  markStudentAttendance,
};