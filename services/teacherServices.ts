import { api } from "./client";

/* ============================================================
   TYPES
============================================================ */

export type TeacherSubject = {
  id: string;
  name: string;
  code?: string | null;
  isOptional?: boolean;
};

export type TeacherSection = {
  sectionId: string;
  sectionName: string;

  classId: string;
  classNumber: string;
  classDisplayName: string;

  academicYearId: string;
  academicYearName: string;

  totalStudents: number;

  isClassTeacher: boolean;

  subjects: TeacherSubject[];
};

export type TeacherAcademicYear = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

export type GetTeacherAssignedSectionsResponse = {
  teacher: {
    id: string;
    name: string;
    email?: string | null;
    employeeId?: string | null;
    designation?: string | null;
    department?: string | null;
  };

  academicYear: TeacherAcademicYear;

  summary: {
    totalSections: number;
    totalStudents: number;
    totalSubjects: number;
    classTeacherSections: number;
  };

  sections: TeacherSection[];
};


export type TeacherAttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "HALF_DAY"
  | "HOLIDAY";

export type TeacherSectionAttendanceStudent = {
  enrollmentId: string;
  id: string;
  admissionNo: string;
  name: string;

  fatherName?: string | null;
  motherName?: string | null;

  gender?: string | null;
  bloodGroup?: string | null;
  photoUrl?: string | null;
  rollNumber?: string | null;

  studentStatus: string;
  enrollmentStatus: string;

  attendance: {
    id: string;
    status: TeacherAttendanceStatus;
    remark?: string | null;
    markedByUserId: string;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export type TeacherSectionAttendanceResponse = {
  date: string;

  academicYear: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };

  section: {
    id: string;
    sectionName: string;
    classId: string;
    classNumber: string;
    classDisplayName: string;
    isClassTeacher: boolean;
  };

  summary: {
    total: number;
    marked: number;
    unmarked: number;
    present: number;
    absent: number;
    late: number;
    halfDay: number;
    holiday: number;
  };

  totalStudents: number;

  students: TeacherSectionAttendanceStudent[];
};



const getSectionAttendance = async (
  sectionId: string,
  date: string
): Promise<TeacherSectionAttendanceResponse> => {
  const response = await api.get(
    "/attendance/student/my-section-attendance",
    {
      params: {
        sectionId,
        date,
      },
    }
  );

  return response.data;
};

const saveSectionAttendance = async (
  sectionId: string,
  date: string,
  attendance: Array<{
    studentId: string;
    status: TeacherAttendanceStatus;
    remark?: string | null;
  }>
) => {
  const response = await api.post(
    "/attendance/student/my-section-attendance",
    {
      sectionId,
      date,
      attendance,
    }
  );

  return response.data;
};


/* ============================================================
   ENDPOINTS
============================================================ */

const endpoints = {
  myClasses:
    "/attendance/student/my-sections",
};

export type TeacherSectionStudent = {
  enrollmentId: string;

  id: string;
  admissionNo: string;
  name: string;

  fatherName?: string | null;
  motherName?: string | null;

  dob?: string | null;
  doj?: string | null;

  gender?: string | null;
  bloodGroup?: string | null;

  phone?: string | null;
  emergencyContact?: string | null;

  photoUrl?: string | null;

  rollNumber?: string | null;

  studentStatus: string;
  enrollmentStatus: string;
};
export type TeacherStudentAttendanceHistoryItem = {
  id: string;
  date: string;
  status: TeacherAttendanceStatus;
  remark?: string | null;
  markedByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type TeacherStudentAttendanceHistoryResponse = {
  academicYear: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };

  student: {
    id: string;
    admissionNo: string;
    name: string;
    fatherName?: string | null;
    photoUrl?: string | null;
    rollNumber?: string | null;
  };

  section: {
    id: string;
    sectionName: string;
    class: {
      id: string;
      classNumber: number;
      displayName: string;
    };
  };

  summary: {
    total: number;
    present: number;
    absent: number;
    late: number;
    halfDay: number;
    holiday: number;
    workingDays: number;
    attendancePercentage: number;
  };

  attendance: TeacherStudentAttendanceHistoryItem[];
};
export type TeacherSectionStudentsResponse = {
  academicYear: {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
  };

  section: {
    id: string;
    sectionName: string;

    classId: string;
    classNumber: string;
    classDisplayName: string;

    isClassTeacher: boolean;
  };

  totalStudents: number;

  students: TeacherSectionStudent[];
};


/* ============================================================
   GET TEACHER ASSIGNED SECTIONS
============================================================ */

const getMyClasses =
  async (): Promise<
    GetTeacherAssignedSectionsResponse
  > => {

    const { data } =
      await api.get<
        GetTeacherAssignedSectionsResponse
      >(
        endpoints.myClasses
      );

    return data;
  };


/* ============================================================
   EXPORT
============================================================ */
const getSectionStudents = async (
  sectionId: string
): Promise<TeacherSectionStudentsResponse> => {
  const response = await api.get(
    "/attendance/student/my-section-students",
    {
      params: {
        sectionId,
      },
    }
  );

  return response.data;
};

const getStudentAttendanceHistory= async (
  studentId: string,
  sectionId: string
): Promise<TeacherStudentAttendanceHistoryResponse> => {
  const response = await api.get(
    "/attendance/student/my-student-attendance-history",
    {
      params: {
        studentId,
        sectionId,
      },
    }
  );

  return response.data;
};

export type TeacherMyStudent = {
  enrollmentId: string;

  id: string;
  admissionNo: string;
  name: string;

  fatherName?: string | null;
  motherName?: string | null;

  dob?: string | null;
  doj?: string | null;

  gender?: string | null;
  bloodGroup?: string | null;

  phone?: string | null;
  emergencyContact?: string | null;

  photoUrl?: string | null;
  rollNumber?: string | null;

  studentStatus: string;
  enrollmentStatus: string;

  classId: string;
  classNumber: string;
  classDisplayName: string;

  sectionId: string;
  sectionName: string;
};

export type TeacherMyStudentsSection = {
  sectionId: string;
  sectionName: string;

  classId: string;
  classNumber: string;
  classDisplayName: string;

  totalStudents: number;
};

export type TeacherMyStudentsResponse = {
  academicYear: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };

  summary: {
    totalStudents: number;
    totalSections: number;
    totalClasses: number;
  };

  sections: TeacherMyStudentsSection[];

  students: TeacherMyStudent[];
};

const getMyStudents = async (): Promise<TeacherMyStudentsResponse> => {
  const response = await api.get(
    "/attendance/student/my-students"
  );

  return response.data;
};


export type TeacherMarksSubject = {
  id: string;
  name: string;
  code: string;
  isOptional: boolean;
};

export type TeacherMarksSection = {
  id: string;
  sectionName: string;
  subjects: TeacherMarksSubject[];
};

export type TeacherMarksClass = {
  id: string;
  classNumber: string;
  displayName: string;
  sections: TeacherMarksSection[];
};

export type TeacherMarksExam = {
  id: string;
  name: string;
  type:
    | "UNIT_TEST"
    | "MID_TERM"
    | "FINAL"
    | "OTHER";
  termNumber: number;
  startDate: string;
  endDate: string;
  isPublished: boolean;

  examSubjects: {
    id: string;
    subjectId: string;
    classId: string;
    maxMarks: number;
    passingMarks: number;
    weightage?: number | null;
    subject: {
      id: string;
      name: string;
      code: string;
    };
  }[];
};

export type TeacherMarksOptionsResponse = {
  academicYear: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };

  classes: TeacherMarksClass[];
  exams: TeacherMarksExam[];
};

export type TeacherMarksEntryStudent = {
  enrollmentId: string;
  id: string;
  admissionNo: string;
  name: string;
  rollNumber?: string | null;
  photoUrl?: string | null;

  mark: {
    id: string;
    marksObtained: number | null;
    isAbsent: boolean;
    isFinalized: boolean;
  } | null;
};

export type TeacherMarksEntryResponse = {
  academicYear: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };

  section: {
    id: string;
    sectionName: string;
    class: {
      id: string;
      classNumber: string;
      displayName: string;
      isCompleted: boolean;
    };
  };

  subject: {
    id: string;
    name: string;
    code: string;
  };

  examSubject: {
    id: string;
    maxMarks: number;
    passingMarks: number;
    weightage?: number | null;
  };

  exam: {
    id: string;
    name: string;
    type: string;
    termNumber: number;
    startDate: string;
    endDate: string;
    isPublished: boolean;
  };

  finalized: boolean;

  summary: {
    totalStudents: number;
    entered: number;
    absent: number;
    pending: number;
  };

  students: TeacherMarksEntryStudent[];
};


const getTeacherMarksOptions=
  async (): Promise<TeacherMarksOptionsResponse> => {

    const response = await api.get(
      "/marks/teacher/options"
    );

    return response.data;
  };

const getTeacherMarksEntry=
  async (
    sectionId: string,
    subjectId: string,
    examId: string
  ): Promise<TeacherMarksEntryResponse> => {

    const response = await api.get(
      "/marks/teacher/entry",
      {
        params: {
          sectionId,
          subjectId,
          examId,
        },
      }
    );

    return response.data;
  };


const saveTeacherMarks=
  async (
    payload: {
      sectionId: string;
      subjectId: string;
      examId: string;
      finalize: boolean;

      marks: Array<{
        studentId: string;
        marksObtained:
          | number
          | null;
        isAbsent: boolean;
      }>;
    }
  ) => {

    const response = await api.post(
      "/marks/teacher/entry",
      payload
    );

    return response.data;
  };


export type TeacherMyAttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "ON_LEAVE";

export type TeacherMyAttendanceRecord = {
  id: string;
  date: string;
  status: TeacherMyAttendanceStatus;
  remark?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TeacherMyAttendanceResponse = {
  academicYear: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };

  month: string | null;

  summary: {
    total: number;
    present: number;
    absent: number;
    halfDay: number;
    onLeave: number;
    attendancePercentage: number;
  };

  totalRecords: number;

  attendance: TeacherMyAttendanceRecord[];
};

export type TeacherMyAttendanceTodayResponse = {
  date: string;
  marked: boolean;
  attendance: TeacherMyAttendanceRecord | null;
};



const getMyAttendance= async (
  month?: string
): Promise<TeacherMyAttendanceResponse> => {
  const response = await api.get(
    "/teacher-attendance/my-attendance",
    {
      params: month ? { month } : undefined,
    }
  );

  return response.data;
};

const getMyAttendanceToday=
  async (): Promise<TeacherMyAttendanceTodayResponse> => {
    const response = await api.get(
      "/teacher-attendance/my-attendance/today"
    );

    return response.data;
  };


  export type TeacherLeaveType =
  | "CL"
  | "SL"
  | "EL"
  | "LWP";

export type TeacherLeaveStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export type TeacherLeaveRequest = {
  id: string;
  fromDate: string;
  toDate: string;
  leaveType: TeacherLeaveType;
  reason: string;
  status: TeacherLeaveStatus;
  appliedAt: string;
  updatedAt: string;
  approvedByUserId?: string | null;
  approvedByUser?: {
    id: string;
    name: string;
  } | null;
};

export type TeacherLeaveResponse = {
  summary: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  totalRequests: number;
  requests: TeacherLeaveRequest[];
};


const getMyLeaves = async (
  status?: TeacherLeaveStatus
): Promise<TeacherLeaveResponse> => {
  const response = await api.get(
    "/teacher-leave/my-leaves",
    {
      params: status ? { status } : undefined,
    }
  );

  return response.data;
};

const applyLeave = async (payload: {
  fromDate: string;
  toDate: string;
  leaveType: TeacherLeaveType;
  reason: string;
}) => {
  const response = await api.post(
    "/teacher-leave",
    payload
  );

  return response.data;
};

const cancelLeave = async (id: string) => {
  const response = await api.delete(
    `/teacher-leave/${id}`
  );

  return response.data;
};


export type TeacherProfile = {
  id: string;
  schoolId: string;

  name: string;
  email: string;
  phone?: string | null;

  role: "TEACHER";

  designation?: string | null;
  department?: string | null;
  employeeId?: string | null;

  profilePhotoUrl?: string | null;

  isActive: boolean;
  mustChangePassword: boolean;

  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TeacherProfileResponse = {
  teacher: TeacherProfile;
};

const getMyProfile= async (): Promise<TeacherProfileResponse> => {
  const response = await api.get(
    "/teacher/profile"
  );

  return response.data;
};

const updateMyProfile= async (payload: {
  name?: string;
  phone?: string | null;
  profilePhotoUrl?: string | null;
}): Promise<TeacherProfileResponse> => {
  const response = await api.patch(
    "/teacher/profile",
    payload
  );

  return response.data;
};

export type TeacherTimetableDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type TeacherTimetableEntry = {
  id: string;

  periodNumber: number;

  startTime: string;
  endTime: string;

  dayOfWeek: TeacherTimetableDay;

  class: {
    id: string;
    classNumber: string;
    displayName?: string | null;
  };

  section: {
    id: string;
    sectionName: string;
  };

  subject: {
    id: string;
    name: string;
    code?: string | null;
  };
};

export type TeacherTimetableDayData = {
  day: TeacherTimetableDay;
  entries: TeacherTimetableEntry[];
};

export type TeacherTimetableResponse = {
  academicYear: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };

  today: TeacherTimetableDay;

  totalPeriods: number;

  timetable: TeacherTimetableDayData[];
};


const getMyTimetable=
  async (): Promise<TeacherTimetableResponse> => {
    const response = await api.get(
      "/teacher-timetable/my-timetable"
    );

    return response.data;
  };


  export type TeacherAssignedSection = {
  sectionId: string;
  sectionName: string;

  classId: string;
  classNumber: string;
  classDisplayName: string;

  academicYearId: string;
  academicYearName: string;

  subjects: {
    id: string;
    name: string;
    code?: string | null;
  }[];

  totalStudents?: number;
  isClassTeacher?: boolean;
};

export type TeacherAssignedSectionsResponse = {
  academicYear: {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
  };

  totalSections: number;

  sections: TeacherAssignedSection[];
};

const getAssignedSections = async (): Promise<TeacherAssignedSectionsResponse> => {
  const response = await api.get(
    "/teacher-attendance/my-sections"
  );

  return response.data;
};


export const teacherServices = {
  getMyClasses,
  getSectionStudents,
  getSectionAttendance,
  saveSectionAttendance,
  getStudentAttendanceHistory,
  getMyStudents,
  getTeacherMarksOptions,
  getTeacherMarksEntry,
  saveTeacherMarks,
  getMyAttendance,
  getMyAttendanceToday,
  getMyLeaves,
  applyLeave,
  cancelLeave,
  getMyProfile,
  updateMyProfile,
  getMyTimetable,
  getAssignedSections,
};