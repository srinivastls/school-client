import {
  SigninRequest,
  SigninResponse,
  DeleteUserRequest,
  DeleteUserResponse,
} from "../types";

import { api } from "./client";

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

  console.log(
    "🔥🔥 SIGNIN SERVICE CALLED"
  );


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


  console.log(
    "🔥🔥 LOGIN TYPE:",
    schoolCode
      ? "SCHOOL"
      : "PLATFORM"
  );


  console.log(
    "🔥🔥 LOGIN ENDPOINT:",
    endpoint
  );


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


  console.log(
    "🔥🔥 LOGIN REQUEST:",
    {
      ...requestPayload,

      password: "***",
    }
  );


  /* ==========================================================================
     API CALL
  ========================================================================== */

  const response =
    await api.post(
      endpoint,
      requestPayload
    );


  console.log(
    "🔥🔥 RESPONSE DATA INSIDE SERVICE:",
    response.data
  );


  const result =
    response.data as SigninResponse;


  console.log(
    "🔥🔥 RESULT BEING RETURNED:",
    result
  );


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

};