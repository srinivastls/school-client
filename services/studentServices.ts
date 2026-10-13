import {
  ClassStudentCountsResponse,
  CreateStudentFormFields,
  CreateStudentResponse,
  EditStudentRequest,
  EditStudentResponse,
  GetStudentByCouponRequest,
  GetStudentRequest,
  GetStudentResponse,
  PromoteDemoteRequest,
  PromoteDemoteResponse,
  StudentRegistrationOptionsResponse,
} from "../types";

import { useUserStore } from "../store/useUserStore";
import { api } from "./client";


const endpoints = {

  get:
    "/student/get",

  create:
    "/student/create",

  getByCoupon:
    "/student/getByCoupon",

  edit:
    "/student/edit",

  classCounts:
    "/student/classCounts",

  promoteDemote:
    "/student/promoteDemote",

  getByClass:
    "/student/getByClass",

  /*
   * Backend:
   * app.get(
   *   "/api/student/registrationOptions",
   *   ...
   * )
   */
  registrationOptions:
    "/student/registrationOptions",
};





/* ============================================================
   GET STUDENT
============================================================ */

const getStudentById = async (
  payload: GetStudentRequest
): Promise<GetStudentResponse> => {

  const { data } =
    await api.post<GetStudentResponse>(
      endpoints.get,
      payload
    );


  return data;
};


/* ============================================================
   GET REGISTRATION OPTIONS
============================================================ */

const getRegistrationOptions =
  async (): Promise<StudentRegistrationOptionsResponse> => {

    const { data } =
      await api.get<StudentRegistrationOptionsResponse>(
        endpoints.registrationOptions
      );


    return data;
  };


/* ============================================================
   CREATE STUDENT
============================================================ */

const createStudent = async (
  payload: CreateStudentFormFields
): Promise<CreateStudentResponse> => {


  //const user = useUserStore((state) => state.user);

  /*
   * Middleware requires `siblings`.
   */
  const siblings =
    Array.isArray(payload.siblings)
      ? payload.siblings
      : [];


  const reqPayload = {

    admissionNo:
      payload.admissionNo,

    name:
      payload.name,

    aadhaar:
      payload.aadhaar,

    fatherName:
      payload.fatherName,


    dob:
      payload.dob,

    doj:
      payload.doj,

    phone:
      payload.phoneNo,

    parentName:
      payload.fatherName,

    academicYearId:
      payload.academicYearId,

    classNumber:
      payload.classNumber,

    sectionName:
      payload.sectionName,

    tie: {
      amount:
        payload.tie,
      pendingAmount:
        payload.tie,
    },

    belt: {
      amount:
        payload.belt,
      pendingAmount:
        payload.belt,
    },

    arrears: {
      amount:
        payload.arrears,
      pendingAmount:
        payload.arrears,
    },

    diary:
      payload.diary,

    couponCode:
      payload.couponCode ||
      undefined,

    tcNo:
      payload.tcNo ||
      undefined,

    /*
     * REQUIRED BY MIDDLEWARE
     */
    siblings,

    /*
     * REQUIRED BY CREATE CONTROLLER
     */
    siblingStudentsFromDb:
      siblings.map(
        (sibling) => ({
          admissionNo:
            sibling.admissionNo,

        })
      ),

    parentRelationship:
      payload.parentRelationship,
  };



  const { data } =
    await api.post<CreateStudentResponse>(
      endpoints.create,
      reqPayload
    );


  return data;
};


/* ============================================================
   GET STUDENT BY COUPON
============================================================ */

const getStudentByCoupon = async (
  payload: GetStudentByCouponRequest
): Promise<GetStudentResponse> => {

  const { data } =
    await api.post<GetStudentResponse>(
      endpoints.getByCoupon,
      payload
    );

  return data;
};


/* ============================================================
   EDIT STUDENT
============================================================ */

const editStudent = async (
  payload: EditStudentRequest
) => {



  const reqPayload = {
    admissionNo:
      payload.admissionNo,

    oldAdmissionNo:
      payload.oldAdmissionNo,

    name:
      payload.name,

    aadhaar:
      payload.aadhaar,

    fatherName:
      payload.fatherName,



    dob:
      payload.dob,

    doj:
      payload.doj,

    phone:
      payload.phoneNo,

    academicYearId:
      payload.academicYearId,

    classNumber:
      payload.classNumber,

    sectionName:
      payload.sectionName,

    tie: {
      amount:
        payload.tie,
      pendingAmount:
        payload.tie,
    },

    belt: {
      amount:
        payload.belt,
      pendingAmount:
        payload.belt,
    },

    arrears: {
      amount:
        payload.arrears,
      pendingAmount:
        payload.arrears,
    },

    diary:
      payload.diary,

    couponCode:
      payload.couponCode || undefined,

    tcNo:
      payload.tcNo || undefined,

    siblings:
      Array.isArray(payload.siblings)
        ? payload.siblings
        : [],

    siblingStudentsFromDb:
      Array.isArray(payload.siblings)
        ? payload.siblings.map(
            (sibling) => ({
              admissionNo:
                sibling.admissionNo,
            })
          )
        : [],
  };


  const { data } =
    await api.post<EditStudentResponse>(
      endpoints.edit,
      reqPayload
    );

  return data;
};


/* ============================================================
   CLASS / STUDENT COUNTS
============================================================ */

const getClassStudentCounts =
  async (
    academicYearId?: string
  ): Promise<ClassStudentCountsResponse> => {

    const { data } =
      await api.get<ClassStudentCountsResponse>(
        endpoints.classCounts,
        {
          params: {
            academicYearId,
          },
        }
      );

    return data;
  };


  export type PromotionStatus =
  | "PROMOTED"
  | "DEMOTED"
  | "REPEATED"
  | "NOT_PROMOTED";

export type PromotionSection = {
  id: string;
  sectionName: string;
};

export type PromotionTargetClass = {
  id: string;
  classNumber: string;
  displayName: string;
  sections: PromotionSection[];
};

export type PromotionStudentResponse = {
  id: string;
  admissionNo?: string;
  name: string;
  fatherName?: string;
  phone?: string;
  rollNumber?: number | string;

  currentClass: {
    id: string;
    classNumber: string;
    displayName: string;
  };

  currentSection: {
    id: string;
    sectionName: string;
  };

  pendingAmount: number;
  eligible: boolean;
  eligibilityReason: string;

  suggestedClass?: {
    id: string;
    classNumber: string;
    displayName: string;
  } | null;

  promotion?: {
    id: string;
    status: PromotionStatus;
    remark?: string;
    toClassId: string;
    toSectionId: string;
    createdAt: string;
  } | null;
};

export type PromotionStudentsResponse = {
  sourceAcademicYear: {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
  };

  targetAcademicYear: {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
  };

  summary: {
    total: number;
    eligible: number;
    notEligible: number;
    alreadyProcessed: number;
  };

  sourceClasses: Array<{
    id: string;
    classNumber: string;
    displayName: string;
  }>;

  targetClasses: PromotionTargetClass[];

  students: PromotionStudentResponse[];
};



export type BulkPromotionItem = {
  studentId: string;
  toClassId: string;
  toSectionId: string;
  status: PromotionStatus;
  remark?: string;
};

export type BulkPromotionRequest = {
  fromAcademicYearId: string;
  toAcademicYearId: string;
  students: BulkPromotionItem[];
};

export type BulkPromotionResponse = {
  message: string;
  count: number;
  processed: Array<{
    promotion: unknown;
    student: unknown;
  }>;
};

type GetPromotionStudentsParams = {
  sourceAcademicYearId: string;
  targetAcademicYearId: string;
  classId?: string;
};

const getPromotionStudents = async ({
  sourceAcademicYearId,
  targetAcademicYearId,
  classId,
}: GetPromotionStudentsParams) => {
  const { data } = await api.get(
    "/academic-year/promotion/students",
    {
      params: {
        sourceAcademicYearId,
        targetAcademicYearId,
        ...(classId ? { classId } : {}),
      },
    }
  );

  return data;
};

const processBulkStudentPromotion = async (
  payload: BulkPromotionRequest
): Promise<BulkPromotionResponse> => {
  const { data } =
    await api.post<BulkPromotionResponse>(
      "/academic-year/promotion/students/bulk",
      payload
    );

  return data;
};

const promoteDemoteBulk = async (
  payload: BulkPromotionRequest
) => {
  const { data } = await api.post(
    "/academic-year/promotion/students/bulk",
    payload
  );

  return data;
};

/* ============================================================
   PROMOTE / DEMOTE
============================================================ */

const promoteDemote = async (
  payload: PromoteDemoteRequest
): Promise<PromoteDemoteResponse> => {

  const { data } =
    await api.post<PromoteDemoteResponse>(
      endpoints.promoteDemote,
      payload
    );

  return data;
};


/* ============================================================
   GET STUDENTS BY CLASS
============================================================ */

const getStudentsByClass = async ({
  classNumber,
  academicYearId,
}: {
  classNumber: string;
  academicYearId?: string;
}) => {

  const { data } =
    await api.post(
      endpoints.getByClass,
      {
        classNumber,

        ...(academicYearId
          ? {
              academicYearId,
            }
          : {}),
      }
    );

  return data;
};


/* ============================================================
   EXPORT
============================================================ */

export const studentServices = {

  getStudentById,

  getRegistrationOptions,

  createStudent,

  getStudentByCoupon,

  editStudent,

  getClassStudentCounts,

  promoteDemote,
  promoteDemoteBulk,

  getStudentsByClass,
  processBulkStudentPromotion,
  getPromotionStudents,
};
