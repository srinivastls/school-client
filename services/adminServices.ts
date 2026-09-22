import {api} from "./client";

export type AdminDashboardData = {
  financial: {
    todayCollection: number;
    weeklyCollection: number;
    monthlyCollection: number;
    pendingFees: number | null;
    defaultersCount: number | null;
  };

  students: {
    total: number;
  };

  teachers: {
    total: number;
    presentToday: number;
    absentToday: number;
    halfDayToday: number;
    onLeaveToday: number;
  };

  operations: {
    pendingLeaveApprovals: number;
  };

  academicYear: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  } | null;

  generatedAt: string;
};

export type AdminDashboardResponse = {
  message: string;
  data: AdminDashboardData;
};

export const adminServices = {
  getDashboard: async (): Promise<AdminDashboardResponse> => {
    const response = await api.get<AdminDashboardResponse>(
      "/admin/dashboard"
    );

    return response.data;
  },
};