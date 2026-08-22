import {
  AdminListScreen,
  ClassFeeFormScreen,
  CouponListScreen,
  CreateCouponScreen,
  Invoice,
  LoginScreen,
  MonthOrDateFeeHistory,
  OldStudentRegistrationFormScreen,
  Payment,
  PercentageUnpaidFeeScreen,
  SignupScreen,
  SplashScreen,
  StudentDetails,
  StudentFeeHistory,
  StudentRegistrationFormScreen,
} from "../screens";
import { Home } from "../screens/Home";
import { RootStackScreenNames, Screen } from "../types";

export const RootScreens: Screen[] = [
  {
    name: RootStackScreenNames.Login,
    component: LoginScreen,
    options: { headerShown: false },
  },
  {
    name: RootStackScreenNames.Signup,
    component: SignupScreen,
    options: { headerTitle: "Create Admin" },
  },
  {
    name: RootStackScreenNames.Home,
    component: Home,
    options: { headerShown: false },
  },
  {
    name: RootStackScreenNames.CreateCoupon,
    component: CreateCouponScreen,
    options: { headerTitle: "Create Coupon" },
  },
  {
    name: RootStackScreenNames.CouponList,
    component: CouponListScreen,
    options: { headerTitle: "Coupons List" },
  },
  {
    name: RootStackScreenNames.AdminList,
    component: AdminListScreen,
    options: { headerTitle: "Admin List" },
  },
  {
    name: RootStackScreenNames.StudentRegistrationForm,
    component: StudentRegistrationFormScreen,
    options: { headerTitle: "Student Registration" },
  },
  {
    name: RootStackScreenNames.OldStudentRegistrationFormScreen,
    component: OldStudentRegistrationFormScreen,
    options: { headerTitle: "Student Registration" },
  },
  {
    name: RootStackScreenNames.ClassFeeForm,
    component: ClassFeeFormScreen,
  },
  {
    name: RootStackScreenNames.PercentageUnpaidFee,
    component: PercentageUnpaidFeeScreen,
    options: { headerTitle: "Report" },
  },
  {
    name: RootStackScreenNames.MonthOrDateFeeHistory,
    component: MonthOrDateFeeHistory,
    options: { headerTitle: "Report" },
  },
  {
    name: RootStackScreenNames.StudentFeeHistory,
    component: StudentFeeHistory,
    options: { headerTitle: "Report" },
  },
  {
    name: RootStackScreenNames.StudentDetails,
    component: StudentDetails,
    options: { headerTitle: "Student Details" },
  },
  {
    name: RootStackScreenNames.Invoice,
    component: Invoice,
    options: { headerTitle: "Invoice" },
  },
  {
    name: RootStackScreenNames.Payment,
    component: Payment,
    options: { headerTitle: "Payment" },
  },
  {
    name: RootStackScreenNames.SplashScreen,
    component: SplashScreen,
    options: { headerShown: false },
  },
];
