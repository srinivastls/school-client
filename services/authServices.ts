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


  /*
   * ========================================================================
   * DETERMINE LOGIN TYPE
   * ========================================================================
   *
   * No schoolCode:
   *
   *   /api/auth/platform/signin
   *
   * SchoolCode provided:
   *
   *   /api/auth/signin
   * ========================================================================
   */

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


  /*
   * ========================================================================
   * BUILD REQUEST PAYLOAD
   * ========================================================================
   *
   * For platform login, don't send schoolCode.
   *
   * For school login, send the normalized schoolCode.
   * ========================================================================
   */

  const requestPayload =
    schoolCode
      ? {
          ...payload,

          schoolCode:
            schoolCode.toUpperCase(),
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


  /*
   * ========================================================================
   * API CALL
   * ========================================================================
   */

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

//   return api.post<SignupResponse>(
//     endpoints.signup,
//     payload
//   );
// };


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
};