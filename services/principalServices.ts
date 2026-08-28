import {api} from "./client";

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

export const principalServices = {
  getTeachers,
  getParents,
  getAdmins,
  createTeacher,
  createAdmin,
  updateParentStatus,
  updateAdminStatus,
  getStudents,
};