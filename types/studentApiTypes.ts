import { StudentDetails } from "../screens";
import { CommonResponse } from "./commonApiTypes";
import { Coupon, Sibling, Student } from "./entityTypes";

export type GetStudentRequest = Pick<Student, "admissionNo">;
export type GetStudentResponse = Student;

export type CreateStudentRequest = Omit<
  Student,
  | "classNumber"
  | "couponCode"
  | "pendingAmount"
  | "siblings"
  | "pendingTuitionFee"
  | "pendingTextbookFee"
  | "pendingNotebookFee"
> & {
  classNumber: string;
  couponCode: string;
  siblings: Omit<Sibling, "name">[];
};
export type CreateStudentResponse = CommonResponse;
export type CreateStudentFormFields = Omit<
  CreateStudentRequest,
  "tie" | "diary" | "belt" | "arrears"
> & {
  tie: string;
  diary: string;
  belt: string;
  arrears: string;
};

export type GetStudentByCouponRequest = Pick<Coupon, "code">;

export type EditStudentRequest = Omit<
  CreateStudentRequest,
  "tie" | "diary" | "belt" | "arrears"
> & {
  oldAdmissionNo: string;
  tie: string;
  diary: string;
  belt: string;
  arrears: string;
};
export type EditStudentResponse = CommonResponse;

export type ClassStudentCountsResponse = CommonResponse & {
  countData: { classNumber: string; count: string }[];
};

export type PromoteDemoteRequest = { fromClass: string; toClass: string };
export type PromoteDemoteResponse = CommonResponse;

export type StudentRegistrationSection = {
  id: string;
  sectionName: string;
};

export type StudentRegistrationClass = {
  id: string;
  classNumber: string;
  displayName: string;

  tuitionFee: string;
  textBookFee: string;
  noteBookFee: string;
  diaryFee: string;

  sections: StudentRegistrationSection[];
};

export type StudentRegistrationAcademicYear = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;

  classes: StudentRegistrationClass[];
};

export type StudentRegistrationOptionsResponse = {
  academicYears: StudentRegistrationAcademicYear[];
  classes: StudentRegistrationClass[];
  sections: StudentRegistrationSection[];

};