import {
  AdminListScreen,
  ClassFeeFormScreen,
  CouponListScreen,
  CreateCouponScreen,
  Invoice,
  LoginScreen,
  MonthOrDateFeeHistory,
  OldStudentRegistrationFormScreen,
  //Payment,
  PercentageUnpaidFeeScreen,
  SplashScreen,
  StudentDetails,
  StudentFeeHistory,
  StudentRegistrationFormScreen,
  PrincipalDashboard,
} from "../screens";
import { RootStackScreenNames, Screen } from "../types";
import { HomeScreen } from "../screens/HomeScreen";

import { PrincipalAcademicsScreen } from "../screens/principal/PrincipalAcademicsScreen";

import { PrincipalStudentsScreen } from "../screens/principal/PrincipalStudentsScreen";
import { PrincipalTeachersScreen } from "../screens/principal/PrincipalTeachersScreen";
import { PrincipalParentsScreen } from "../screens/principal/PrincipalParentsScreen";
import { PrincipalClassesScreen } from "../screens/principal/PrincipalClassesScreen";
import { PrincipalClassStudentsScreen } from "../screens/principal/PrincipalClassStudentsScreen";
import { PrincipalFinanceScreen } from "../screens/principal/PrincipalFinanceScreen";
import { Component } from "react";

export const RootScreens: Screen[] = [
  {
    name: RootStackScreenNames.Login,
    component: LoginScreen,
    options: { headerShown: false },
  },
  // {
  //   name: RootStackScreenNames.Signup,
  //   component: SignupScreen,
  //   options: { headerTitle: "Create Admin" },
  // },
  {
    name: RootStackScreenNames.Home,
    component: HomeScreen,
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
  // {
  //   name: RootStackScreenNames.Payment,
  //   component: Payment,
  //   options: { headerTitle: "Payment" },
  // },
  {
    name: RootStackScreenNames.SplashScreen,
    component: SplashScreen,
    options: { headerShown: false },
  },
  {
    name: RootStackScreenNames.PrincipalDashboard,
    component:PrincipalDashboard,
    options:{headerTitle:"Dashboard"}
  },

  {
  name:RootStackScreenNames.PrincipalStudents,
  component:PrincipalStudentsScreen,
  options:{headerTitle:"Students"}

  },
  {
    name: RootStackScreenNames.PrincipalTeachers,
    component: PrincipalTeachersScreen,
    options: { headerTitle: "Teachers" },
  },
  {
    name: RootStackScreenNames.PrincipalParents,
    component: PrincipalParentsScreen,
    options: { headerTitle: "Parents" },
  },
  {
    name: RootStackScreenNames.PrincipalClasses,
    component: PrincipalClassesScreen,
    options: { headerTitle: "Classes" },
  },
  {
    name: RootStackScreenNames.PrincipalClassStudents,
    component: PrincipalClassStudentsScreen,
    options: { headerTitle: "Class Students"},
  },
  {
    name: RootStackScreenNames.PrincipalFinance,
    component: PrincipalFinanceScreen,
    options: { headerTitle: "Finance Dashboard" },
  },
  {
    name: RootStackScreenNames.PrincipalAcademics,
    component: PrincipalAcademicsScreen,
    options: { headerTitle: "Academics Dashboard" },
  },
];
