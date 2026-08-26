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
  [RootStackScreenNames.PrincipalPendingDues]: undefined;
  [RootStackScreenNames.PrincipalDefaulterStudents]: undefined;
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
  [RootStackScreenNames.PrincipalClassStudents]: { classNumber: string };
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
