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
};

export type Screen<
  S = RootStackScreenNames,
  O = NativeStackNavigationOptions
> = {
  name: S;
  component: any;
  options?: O;
};
