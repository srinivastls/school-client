import { api } from "./client";

export const principalStudentPerformanceTrendServices = {
  getOptions: async (academicYearId: string) => {
    const response = await api.get("/principal-student-performance-trends/options", { params: { academicYearId } });
    return response.data;
  },
  getTrends: async (params: { academicYearId: string; classId: string; studentId?: string }) => {
    const response = await api.get("/principal-student-performance-trends", { params });
    return response.data;
  },
};
