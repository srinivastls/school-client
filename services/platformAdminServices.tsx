import AppbarAction from "react-native-paper/lib/typescript/components/Appbar/AppbarAction";
import {api} from "./client";

export const platformAdminServices = {
  getDashboard: async () => {
    const response = await api.get(
      "/platform/dashboard/"
    );

    return response.data;
  },

  getSchools: async () => {
    const response = await api.get(
      "/platform/schools"
    );

    return response.data;
  },

  getSchoolById: async (schoolId: string) => {
  const response = await api.get(
    `/platform/schools/${schoolId}`
  );

  return response.data;
},


  createSchool: async (data: {
    code: string;
    name: string;
    address?: string;
    contactEmail?: string;
    contactPhone?: string;
    board?: string;
    subscriptionPlan: string;
    maxStudents: number;
    maxStaffAccounts: number;
  }) => {
    const response = await api.post(
      "/platform/schools",
      data
    )

    return response.data;
  },
  createPrincipal: async (
  schoolId: string,
  data: {
    name: string;
    email: string;
    password: string;
    designation?: string;
    phone?: string;
  }
) => {
  const response = await api.post(
    `/platform/schools/${schoolId}/principal`,
    data
  );

  return response.data;
},

updateSchoolStatus: async (
  schoolId: string,
  status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED"
) => {
  const response = await api.patch(
    `/platform/schools/${schoolId}/status`,
    { status }
  );

  return response.data;
}
}