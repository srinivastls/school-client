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
  EditStudent= "EditStudent",
  StudentRegistration = "StudentRegistration",
  PlatformSchools = "PlatformSchools",
  PlatformAdminDashboard = "PlatformAdminDashboard",
  PlatformAdminCreateSchool = "PlatformAdminCreateSchool",
  AdminDashboard = "AdminDashboard",
  TeacherDashboard = "TeacherDashboard",
  ParentDashboard = "ParentDashboard",
  PlatformAdminCreatePrincipal ="PlatformAdminCreatePrincipal",
  PlatformAdminSchoolDetails = "PlatformAdminSchoolDetails",
}

export type RootStackParamList = {
  [RootStackScreenNames.Home]: undefined;
  [RootStackScreenNames.Login]: undefined;
  [RootStackScreenNames.Signup]: undefined;
  [RootStackScreenNames.CreateCoupon]: undefined;
  [RootStackScreenNames.CouponList]: undefined;
  [RootStackScreenNames.AdminList]: undefined;
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
};


export type Screen<
  S = RootStackScreenNames,
  O = NativeStackNavigationOptions
> = {
  name: S;
  component: any;
  options?: O;
};
