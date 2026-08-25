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

  console.log(
    "GET STUDENT RESPONSE:",
    data
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

    console.log(
      "REGISTRATION OPTIONS:",
      data
    );

    return data;
  };


/* ============================================================
   CREATE STUDENT
============================================================ */

const createStudent = async (
  payload: CreateStudentFormFields
): Promise<CreateStudentResponse> => {

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
  };


  console.log(
    "CREATE STUDENT REQUEST:",
    JSON.stringify(
      reqPayload,
      null,
      2
    )
  );


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

  console.log(
    "EDIT STUDENT RAW PAYLOAD:",
    JSON.stringify(payload, null, 2)
  );

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

  console.log(
    "EDIT STUDENT REQUEST:",
    JSON.stringify(
      reqPayload,
      null,
      2
    )
  );

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
  async (): Promise<ClassStudentCountsResponse> => {

    const { data } =
      await api.get<ClassStudentCountsResponse>(
        endpoints.classCounts
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

  getStudentsByClass,
};