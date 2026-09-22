import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Class, Student, Transaction } from "./entityTypes";

export enum RootStackScreenNames {
  Home = "Home",
  Login = "Login",
  Signup = "Signup",
  CreateCoupon = "CreateCoupon",
  CouponList = "CouponList",
  AdminList = "AdminList",
  StudentRegistrationForm = "StudentRegistrationForm",
  OldStudentRegistrationFormScreen = "OldStudentRegistrationFormScreen",
  ClassFeeForm = "ClassFeeForm",
  PercentageUnpaidFee = "PercentageUnpaidFee",
  MonthOrDateFeeHistory = "MonthOrDateFeeHistory",
  StudentFeeHistory = "StudentFeeHistory",
  StudentDetails = "StudentDetails",
  Invoice = "Invoice",
  Payment = "Payment",
  SplashScreen = "SplashScreen",
  PrincipalDashboard = "PrincipalDashboard",
  PrincipalStudents = "PrincipalStudents",
  PrincipalTeachers = "PrincipalTeachers",
  PrincipalParents = "PrincipalParents",
  PrincipalClasses = "PrincipalClasses",
  PrincipalClassStudents = "PrincipalClassStudents",
  PrincipalFinance = "PrincipalFinance",
  PrincipalAcademics = "PrincipalAcademics",
  EditStudent = "EditStudent",
  StudentRegistration = "StudentRegistration",
  PlatformSchools = "PlatformSchools",
  PlatformAdminDashboard = "PlatformAdminDashboard",
  PlatformAdminCreateSchool = "PlatformAdminCreateSchool",
  AdminDashboard = "AdminDashboard",
  TeacherDashboard = "TeacherDashboard",
  ParentDashboard = "ParentDashboard",
  PlatformAdminCreatePrincipal = "PlatformAdminCreatePrincipal",
  PlatformAdminSchoolDetails = "PlatformAdminSchoolDetails",
  PrincipalCreateTeacher = "PrincipalCreateTeacher",
  PrincipalTeacherDetails = "PrincipalTeacherDetails",
  ParentChildDetails = "ParentChildDetails",
  PrincipalParentDetails = "PrincipalParentDetails",
  PrincipalCreateAdmin = "PrincipalCreateAdmin",
  Principaladmin = "Principaladmin",
  PrincipalAdminDetails = "PrincipalAdminDetails",
  PrincipalFeeCollection = "PrincipalFeeCollection",
  PrincipalPendingDues = "PrincipalPendingDues",
  PrincipalDefaulterStudents = "PrincipalDefaulterStudents",
  PrincipalAttendanceDashboard = "PrincipalAttendanceDashboard",
  PrincipalClassDetails = "PrincipalClassDetails",
  PrincipalAcademicYearManagement = "PrincipalAcademicYearManagement",
  ClassManagement = "ClassManagement",
  PrincipalClassTeachers = "PrincipalClassTeachers",
  TeacherTimetable = "TeacherTimetable",
  TeacherProfile = "TeacherProfile",
  TeacherMyClasses= "TeacherMyClasses",
  TeacherMyStudents = "TeacherMyStudents",
  TeacherClassDetails = "TeacherClassDetails",
  TeacherSectionDetails = "TeacherSectionDetails",
  TeacherSectionStudents = "TeacherSectionStudents",
  TeacherSectionAttendance = "TeacherSectionAttendance",
  TeacherStudentAttendanceHistory = "TeacherStudentAttendanceHistory",
  TeacherMarksEntry = "TeacherMarksEntry",
  TeacherMyAttendance = "TeacherMyAttendance",
  TeacherLeave = "TeacherLeave",
  TeacherAttendance = "TeacherAttendance",
  // Admin Module
AdminFeatureMenu = "AdminFeatureMenu",

AdminStudentManagement = "AdminStudentManagement",
AdminStudentRegistration = "AdminStudentRegistration",
AdminStudentDetails = "AdminStudentDetails",
AdminStudentEdit = "AdminStudentEdit",
AdminFinanceManagement = "AdminFinanceManagement",
AdminStaffManagement = "AdminStaffManagement",
AdminAttendanceCalendar = "AdminAttendanceCalendar",
AdminCommunication = "AdminCommunication",
AdminSchoolSettings = "AdminSchoolSettings",
AdminReports = "AdminReports",
}

export type ParentChild = {
  id: string;
  admissionNo: string;
  name: string;
  phone?: string | null;
  status: string;
  relationship: "FATHER" | "MOTHER" | "GUARDIAN";
  isPrimary: boolean;
  class: {
    id: string;
    classNumber: string;
    displayName: string;
  };
  section: {
    id: string;
    sectionName: string;
  };
};

export type RootStackParamList = {
  [RootStackScreenNames.Home]: undefined;
  [RootStackScreenNames.Login]: undefined;
  [RootStackScreenNames.Signup]: undefined;
  [RootStackScreenNames.CreateCoupon]: undefined;
  [RootStackScreenNames.CouponList]: undefined;
  [RootStackScreenNames.AdminList]: undefined;
  [RootStackScreenNames.Principaladmin]: undefined;
  [RootStackScreenNames.PrincipalClassDetails]:{
    classNumber: string;
  };
  [RootStackScreenNames.PrincipalPendingDues]: undefined;
  [RootStackScreenNames.PrincipalDefaulterStudents]: undefined;
  [RootStackScreenNames.PrincipalAttendanceDashboard]: undefined;
  [RootStackScreenNames.ClassManagement]: undefined;
  [RootStackScreenNames.TeacherMyClasses]: undefined;
  [RootStackScreenNames.AdminStudentRegistration]: undefined;
  [RootStackScreenNames.AdminStudentDetails]: {
    admissionNo: string;
  };
  [RootStackScreenNames.TeacherSectionDetails]: {
  sectionId: string;
  classId: string;
  classNumber?: string;
  sectionName?: string;
};
[RootStackScreenNames.TeacherMyAttendance]: undefined;
[RootStackScreenNames.TeacherMarksEntry]: undefined;
[RootStackScreenNames.TeacherMyStudents]: undefined;
[RootStackScreenNames.TeacherTimetable]: undefined;
[RootStackScreenNames.TeacherAttendance]: undefined;
[RootStackScreenNames.AdminFeatureMenu]: undefined;

[RootStackScreenNames.AdminStudentManagement]: undefined;

[RootStackScreenNames.AdminFinanceManagement]: undefined;

[RootStackScreenNames.AdminStaffManagement]: undefined;

[RootStackScreenNames.AdminAttendanceCalendar]: undefined;

[RootStackScreenNames.AdminCommunication]: undefined;

[RootStackScreenNames.AdminSchoolSettings]: undefined;

[RootStackScreenNames.AdminReports]: undefined;
[RootStackScreenNames.AdminStudentDetails]: {
  admissionNo: string;
};
[RootStackScreenNames.AdminStudentEdit]: {
  admissionNo: string;
};
[RootStackScreenNames.TeacherStudentAttendanceHistory]: {
  studentId: string;
  sectionId: string;
  classId: string;
  classNumber?: string;
  sectionName?: string;
  studentName?: string;
};
[RootStackScreenNames.TeacherLeave]: undefined;
[RootStackScreenNames.TeacherProfile]: undefined;
[RootStackScreenNames.TeacherSectionAttendance]: {
  sectionId: string;
  classId: string;
  classNumber?: string;
  sectionName?: string;
};
[RootStackScreenNames.TeacherSectionStudents]: {
  sectionId: string;
  classId: string;
  classNumber?: string;
  sectionName?: string;
};
  [RootStackScreenNames.TeacherClassDetails]: {
    classId: string;
  };
  [RootStackScreenNames.PrincipalAdminDetails]: {
    adminId: string;
  };
  [RootStackScreenNames.StudentRegistrationForm]:
    | {
        preFetchedData: Partial<Student>;
      }
    | undefined;
  [RootStackScreenNames.OldStudentRegistrationFormScreen]: undefined;
  [RootStackScreenNames.ClassFeeForm]: { preFetchedClass: Class } | undefined;
  [RootStackScreenNames.PercentageUnpaidFee]: undefined;
  [RootStackScreenNames.MonthOrDateFeeHistory]: undefined;
  [RootStackScreenNames.StudentFeeHistory]: undefined;
  [RootStackScreenNames.StudentDetails]: { student: Student };
  [RootStackScreenNames.Invoice]: {
    student: Student;
    transaction: Transaction;
  };
  [RootStackScreenNames.Payment]: { student: Student };
  [RootStackScreenNames.SplashScreen]: undefined;
  [RootStackScreenNames.PrincipalClassStudents]: { sectionId: string};
  [RootStackScreenNames.PrincipalStudents]: undefined;
  [RootStackScreenNames.PrincipalTeachers]: undefined;
  [RootStackScreenNames.PrincipalParents]: undefined;
  [RootStackScreenNames.PrincipalClasses]: undefined;
  [RootStackScreenNames.PrincipalFinance]: undefined;
  [RootStackScreenNames.PrincipalDashboard]: undefined;
  [RootStackScreenNames.PrincipalAcademics]: undefined;
  [RootStackScreenNames.PrincipalFeeCollection]: undefined;
  [RootStackScreenNames.StudentRegistration]:undefined;
  [RootStackScreenNames.EditStudent]: { preFetchedData: Student };
  [RootStackScreenNames.PlatformSchools]: undefined;
  [RootStackScreenNames.PlatformAdminDashboard]: undefined;
  [RootStackScreenNames.PlatformAdminCreateSchool]: undefined;
  [RootStackScreenNames.AdminDashboard]: undefined;
  [RootStackScreenNames.TeacherDashboard]: undefined;
  [RootStackScreenNames.ParentDashboard]: undefined;
  [RootStackScreenNames.PlatformAdminCreatePrincipal]: { schoolId: string;
  schoolCode: string;
  schoolName: string;
},
  [RootStackScreenNames.PlatformAdminSchoolDetails]: { schoolId: string;},
  [RootStackScreenNames.PrincipalClassTeachers]: undefined;
  [RootStackScreenNames.PrincipalAcademicYearManagement]: undefined;
  [RootStackScreenNames.PrincipalCreateTeacher]: undefined;
  [RootStackScreenNames.PrincipalCreateAdmin]: undefined;
  [RootStackScreenNames.PrincipalTeacherDetails]: {
  teacher: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    designation?: string | null;
    department?: string | null;
    employeeId?: string | null;
    profilePhotoUrl?: string | null;
    isActive: boolean;
    mustChangePassword?: boolean;
    lastLogin?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  };
  [RootStackScreenNames.ParentChildDetails]: {
  child: {
    id: string;
    admissionNo: string;
    name: string;
    phone?: string | null;
    status: string;

    relationship:
      | "FATHER"
      | "MOTHER"
      | "GUARDIAN";

    isPrimary: boolean;

    class: {
      id: string;
      classNumber: string;
      displayName: string;
    };

    section: {
      id: string;
      sectionName: string;
    };
  };
};

[RootStackScreenNames.PrincipalParentDetails]: {
  parent: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    isActive: boolean;
    mustChangePassword: boolean;
    lastLogin?: string | null;
    createdAt: string;
    updatedAt: string;
    children: ParentChild[];
  };
};

};


export type Screen<
  S = RootStackScreenNames,
  O = NativeStackNavigationOptions
> = {
  name: S;
  component: any;
  options?: O;
};
