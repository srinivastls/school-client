import { api } from "./client";

export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "ON_LEAVE";

const unwrap = <T,>(response: any): T =>
  response?.data?.data ?? response?.data ?? response;

import dayjs from "dayjs";



export const adminAttendanceLeaveServices = {

  async getTeachersForAttendance(params?: {
  date?: string;
}) {
  const formattedParams = {
    ...params,
    date: params?.date
      ? dayjs(params.date, "DD/MM/YYYY").format("YYYY-MM-DD")
      : undefined,
  };

  const response = await api.get("/admin/getteachers", {
    params: formattedParams,
  });

  return response.data.teachers ?? [];
},

  async getTeachers(params?: { date?: string }) {
    const formattedParams = {
    ...params,
    date: params?.date
      ? dayjs(params.date, "DD/MM/YYYY").format("YYYY-MM-DD")
      : undefined,
  };
    const response = await api.get("/admin/teachers", { params: formattedParams });

    return unwrap<any[]>(response);
  },

  async getTeacherAttendance(params: { date: string }) {
    const response = await api.get(
      "/admin/teacher-attendance",
      { params }
    );

    return response.data.attendance ?? [];
  },

  async bulkMarkTeacherAttendance(payload: {
    date: string;
    records: {
      teacherId: string;
      status: AttendanceStatus;
      remarks?: string;
      leaveType?: "CL" | "SL" | "EL" | "LWP";
    }[];
  }) {
    const response = await api.post(
      "/admin/teacher-attendance/bulk",
      payload
    );

    return unwrap<any>(response);
  },

  async getLeaveRequests(params?: {
    status?: "PENDING" | "APPROVED" | "REJECTED";
  }) {
    const response = await api.get(
      "/admin/leave-requests",
      { params }
    );

    return response.data.requests ?? [];
  },

  async decideLeave(payload: {
    leaveId: string;
    decision: "APPROVED" | "REJECTED";
    remarks?: string;
  }) {
    const response = await api.patch(
      `/admin/leave-requests/${payload.leaveId}/decision`,
      {
        decision: payload.decision,
        remarks: payload.remarks,
      }
    );

    return unwrap<any>(response);
  },

};