import { api } from "./client";

export const platformAdminServices = {
  getDashboard: async () => (await api.get("/platform/dashboard/")).data,

  getSchools: async () => (await api.get("/platform/schools")).data,

  getSchoolById: async (schoolId: string) =>
    (await api.get(`/platform/schools/${schoolId}`)).data,

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
  }) => (await api.post("/platform/schools", data)).data,

  createPrincipal: async (
    schoolId: string,
    data: {
      name: string;
      email: string;
      password: string;
      designation?: string;
      phone?: string;
    }
  ) => (await api.post(`/platform/schools/${schoolId}/principal`, data)).data,


  updatePrincipal: async (
    schoolId: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      designation?: string;
      department?: string;
      employeeId?: string;
    }
  ) => (await api.patch(`/platform/schools/${schoolId}/principal`, data)).data,

  deletePrincipal: async (schoolId: string) =>
    (await api.delete(`/platform/schools/${schoolId}/principal`)).data,

  updateSchoolStatus: async (
    schoolId: string,
    status: "ACTIVE" | "SUSPENDED"
  ) => (await api.patch(`/platform/schools/${schoolId}/status`, { status })).data,

  getAcademicYearDeletionPreview: async (schoolId: string, academicYearId: string) =>
    (await api.get(`/platform/schools/${schoolId}/academic-years/${academicYearId}/deletion-preview`)).data,

  exportCompleteSchool: async (schoolId: string) =>
    (await api.post(`/platform/schools/${schoolId}/exports/full`)).data,

  exportAcademicYear: async (schoolId: string, academicYearId: string) =>
    (await api.post(`/platform/schools/${schoolId}/exports/academic-year/${academicYearId}`)).data,

  getExportStatus: async (exportId: string) =>
    (await api.get(`/platform/exports/${exportId}`)).data,

  getSchoolDataOperations: async (schoolId: string) =>
    (await api.get(`/platform/schools/${schoolId}/data-operations`)).data,

  archiveSchool: async (schoolId: string) =>
    (await api.post(`/platform/schools/${schoolId}/archive`)).data,

  restoreSchool: async (schoolId: string) =>
    (await api.post(`/platform/schools/${schoolId}/restore`)).data,

  //getprofile: async () => (await api.get("/users/profile")).data,

  deleteAcademicYear: async (
    schoolId: string,
    academicYearId: string,
    confirmation: string
  ) =>
    (await api.delete(`/platform/schools/${schoolId}/academic-years/${academicYearId}`, {
      data: { confirmation },
    })).data,

  deleteSchool: async (schoolId: string, confirmation: string) =>
    (await api.delete(`/platform/schools/${schoolId}`, {
      data: { confirmation },
    })).data,
};
