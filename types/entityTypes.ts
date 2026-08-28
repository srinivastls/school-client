/* ============================================================================
   AUTH / SCHOOL USER
============================================================================ */

import { CommonResponse } from "./commonApiTypes";

export enum SchoolUserRole {
  PRINCIPAL = "PRINCIPAL",
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  PARENT = "PARENT",
}

export enum PlatformAdminRole {
  PLATFORM_ADMIN = "PLATFORM_ADMIN",
}

export type AcademicYear = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

export type GetAcademicYearsResponse = {
  academicYears: AcademicYear[];
};

export type SchoolUser = {
  id: string;
  name: string;
  email: string;
  role: SchoolUserRole;
  designation: string | null;
  schoolId: string;
  schoolCode: string;
  schoolName: string;
};

/* ============================================================================
   SCHOOL USER SIGN IN
============================================================================ */

export type SigninRequest = {
  schoolCode: string;
  identifier: string;
  email: string;
  password: string;
};

export type SigninResponse = {
  user: SchoolUser;
  accessToken: string;
  accessTokenTTL: number;
  accessTokenFetchedAt: number;
};

/* ============================================================================
   PLATFORM ADMIN SIGN IN
============================================================================ */

export type PlatformAdminSigninRequest = {
  email: string;
  password: string;
};

export type PlatformAdminSigninResponse = {
  id: string;
  accessToken: string;
  accessTokenTTL: number;
  name: string;
  email: string;
  role: PlatformAdminRole;
  type: "PLATFORM_ADMIN";
};

export type Class = {
  id: string;
  classNumber: string;
  tuitionFee: string;
  textBookFee: string;
  noteBookFee: string;
  year: string;
};

export enum CouponStatus {
  ACTIVE = "ACTIVE",
  APPLIED = "APPLIED",
}

export type Coupon = {
  code: string;
  classNumber: string;
  discount: string;
  status: CouponStatus;
  createdAt: string;
};

export type Sibling = {
  admissionNo: string;
  name: string;
};
export type Student = {
  admissionNo: string;
  name: string;
  aadhaar: string;
  fatherName: string;
  academicYearId: string;
  sectionName: string;
  dob: string;
  doj: string;
  phoneNo: string;
  classNumber: Class;
  tie: { amount: string; pendingAmount: string };
  diary: { amount: string; pendingAmount: string };
  belt: { amount: string; pendingAmount: string };
  arrears: { amount: string; pendingAmount: string };
  pendingAmount: string;
  pendingTuitionFee: string;
  pendingTextbookFee: string;
  pendingNotebookFee: string;
  couponCode?: Coupon;
  tcNo?: string;
  siblings: Sibling[];
};

export enum PaymentMode {
  cash = "cash",
  wallet = "wallet",
}

export type AmountDetails = {
  tie: string;
  diary: string;
  belt: string;
  arrears: string;
} & Pick<Class, "tuitionFee" | "textBookFee" | "noteBookFee"> & {
    other: string;
  };
export type Transaction = {
  id: string;
  date: string;
  student: Student;
  adminId: string;
  amount: string;
  amountDetails: AmountDetails;
  pendingAmount: string;
  paymentMode: PaymentMode;
  classNumber: string;
};



export type CreateSchoolRequest = {
  code: string;
  name: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  board?: string;

  subscriptionPlan?: string;

  maxStudents?: number;
  maxStaffAccounts?: number;

  gracePeriodDays?: number;
};


export type CreatePrincipalRequest = {
  name: string;
  email: string;
  password: string;

  designation?: string;
  phone?: string;
  department?: string;
  employeeId?: string;
};


export type DeleteUserRequest = { email: string };
export type DeleteUserResponse = CommonResponse;