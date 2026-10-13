import {api} from "./client";
import { TeacherProfileResponse } from "./teacherServices";

const getTeachers = async () => {
  const response = await api.get(
    "/principal/teachers"
  );

  return response.data;
};


const getParents = async () => {

  const response =
    await api.get(
      "/principal/parents"
    );

  return response.data;
};

const createTeacher = async (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  designation?: string;
  department?: string;
  employeeId?: string;
}) => {
  const response = await api.post(
    "/auth/teacher",
    data
  );

  return response.data;
};

const updateParentStatus = async (
  userId: string,
  isActive: boolean
) => {
  const response = await api.patch(
    `/auth/parent/${userId}/status`,
    {
      isActive,
    }
  );

  return response.data;
};




const createAdmin = async (payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  designation?: string;
  department?: string;
  employeeId?: string;
}) => {
  const response = await api.post(
    "/auth/admin",
    payload
  );

  return response.data;
};

const getAdmins = async () => {
  const response =
    await api.get(
      "/auth/admins"
    );

  return response.data;
};


const updateAdminStatus = async (
  userId: string,
  isActive: boolean
) => {

  const response =
    await api.patch(
      `/auth/admin/${userId}/status`,
      {
        isActive,
      }
    );

  return response.data;
};

export const getStudents=async () => {
  const response = await api.get(
    "/students/getAll"
  );
  return response.data;
};

const getClasses = async (academicYearId: string) => {
  const response = await api.get("/class/getAll", {
    params: {
      academicYearId,
    },

  });

  return response.data;
};

export type PrincipalProfile = {
  id: string;
  schoolId: string;

  name: string;
  email: string;
  phone?: string | null;

  role: "PRINCIPAL";

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

export type PrincipalProfileResponse = {
  principal: PrincipalProfile;
};

const getMyProfile= async (): Promise<PrincipalProfileResponse> => {
  const response = await api.get(
    "/principal/profile"
  );

  return response.data;
};

const updateMyProfile= async (payload: {
  name?: string;
  phone?: string | null;
  profilePhotoUrl?: string | null;
}): Promise<PrincipalProfileResponse> => {
  const response = await api.patch(
    "/principal/profile",
    payload
  );

  return response.data;
};


export const principalServices = {
  getTeachers,
  getParents,
  getAdmins,
  createTeacher,
  createAdmin,
  updateParentStatus,
  updateAdminStatus,
  getStudents,
  getClasses,
  getMyProfile,
  updateMyProfile,
};