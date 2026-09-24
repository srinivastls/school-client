import {
  SigninRequest,
  SigninResponse,
  DeleteUserRequest,
  DeleteUserResponse,
} from "../types";

import { api } from "./client";
import { PrincipalProfileResponse } from "./principalServices";

/* ============================================================================
   ENDPOINTS
============================================================================ */

const endpoints = {
  signin: "/auth/signin",

  platformSignin:
    "/auth/platform/signin",

  signup: "/auth/signup",

  delete: "/auth/delete",
};


/* ============================================================================
   SIGNIN
============================================================================ */

const signin = async (
  payload: SigninRequest
): Promise<SigninResponse> => {



  /* ==========================================================================
     DETERMINE LOGIN TYPE

     No schoolCode:
       /api/auth/platform/signin

     SchoolCode provided:
       /api/auth/signin
  ========================================================================== */

  const schoolCode =
    payload.schoolCode?.trim();


  const endpoint =
    schoolCode
      ? endpoints.signin
      : endpoints.platformSignin;





  /* ==========================================================================
     BUILD REQUEST PAYLOAD

     PLATFORM LOGIN
       email
       password

     SCHOOL LOGIN
       schoolCode
       identifier
       password

     identifier can be:
       - Email
       - Parent mobile number
  ========================================================================== */

  const requestPayload =
    schoolCode
      ? {
          schoolCode:
            schoolCode.toUpperCase(),

          identifier:
            payload.identifier.trim(),

          password:
            payload.password,
        }
      : {
          email:
            payload.email.trim(),

          password:
            payload.password,
        };




  /* ==========================================================================
     API CALL
  ========================================================================== */

  const response =
    await api.post(
      endpoint,
      requestPayload
    );




  const result =
    response.data as SigninResponse;


  return result;
};


/* ============================================================================
   SIGNUP
============================================================================ */

// const signup = (
//   payload: SignupRequest
// ) => {
//   return api.post<SigninResponse>(
//     endpoints.signup,
//     payload
//   );
// };


/* ============================================================================
   UPDATE TEACHER STATUS
============================================================================ */

const updateTeacherStatus = async (
  userId: string,
  isActive: boolean
) => {

  const response =
    await api.patch(
      `/auth/teacher/${userId}/status`,
      {
        isActive,
      }
    );

  return response.data;
};
export type Profile = {
  id: string;
  schoolId: string;
  name: string;
  email: string;
  phone?: string | null;

  role: string;

  designation?: string | null;
  department?: string | null;
  employeeId?: string | null;

  profilePhotoUrl?: string | null;

  isActive: boolean;
  mustChangePassword: boolean;

  lastLogin?: string | null;

  createdAt: string;
  updatedAt: string;
};

export type ProfileResponse = {
  profile: Profile;
};

export type UpdateProfilePayload = {
  name?: string;
  phone?: string | null;
  profilePhotoUrl?: string | null;
};

// ============================================================
// GET PROFILE
// ============================================================

const getProfile = async (): Promise<ProfileResponse> => {
  const response = await api.get("/users/profile");

  return response.data;
};

// ============================================================
// UPDATE PROFILE
// ============================================================

const updateProfile = async (
  payload: UpdateProfilePayload
): Promise<ProfileResponse> => {
  const response = await api.patch(
    "/principal/profile",
    payload
  );

  return response.data;
};






/* ============================================================================
   DELETE USER
============================================================================ */

const deleteUser = (
  payload: DeleteUserRequest
) => {

  return api.post<DeleteUserResponse>(
    endpoints.delete,
    payload
  );
};


/* ============================================================================
   EXPORT
============================================================================ */

export const userServices = {

  signin,

  deleteUser,

  updateTeacherStatus,

  getProfile,

  updateProfile,
};