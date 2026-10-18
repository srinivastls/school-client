import { api } from "./client";

export type TimetableDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type TimetableClassOption = {
  id: string;
  classNumber: string;
  displayName: string;
  subjects: { id: string; name: string; code: string; isOptional?: boolean }[];
  sections: { id: string; sectionName: string }[];
};

export type TimetableTeacherOption = {
  id: string;
  name: string;
  email?: string | null;
  employeeId?: string | null;
  designation?: string | null;
};

export type TeacherSubjectOption = {
  id: string;
  teacherUserId: string;
  subjectId: string;
  sectionId: string;
};

export type TimetableEntry = {
  id: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherUserId: string;
  academicYear: string;
  dayOfWeek: TimetableDay;
  periodNumber: number;
  startTime: string;
  endTime: string;
  class: { id: string; classNumber: string; displayName: string };
  section: { id: string; sectionName: string };
  subject: { id: string; name: string; code: string };
  teacher: {
    id: string;
    name: string;
    email?: string | null;
    employeeId?: string | null;
    designation?: string | null;
  };
};

export type TimetableOptionsResponse = {
  academicYear: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  };
  classes: TimetableClassOption[];
  teachers: TimetableTeacherOption[];
  mappings: TeacherSubjectOption[];
};

export type TimetableEntriesResponse = {
  academicYear: TimetableOptionsResponse["academicYear"];
  total: number;
  entries: TimetableEntry[];
};

export type TimetableEntryPayload = {
  academicYearId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherUserId: string;
  dayOfWeek: TimetableDay;
  periodNumber: number;
  startTime: string;
  endTime: string;
};

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ?? error?.message ?? fallback;

const getTimetableOptions = async (academicYearId: string): Promise<TimetableOptionsResponse> => {
  try {
    const response = await api.get("/principal-timetable/options", {
      params: { academicYearId },
    });
    return response.data as TimetableOptionsResponse;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load timetable options."));
  }
};

const getTimetable = async (
  academicYearId: string,
  filters?: { classId?: string; sectionId?: string }
): Promise<TimetableEntriesResponse> => {
  try {
    const response = await api.get("/principal-timetable", {
      params: { academicYearId, ...filters },
    });
    return response.data as TimetableEntriesResponse;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load timetable entries."));
  }
};

const createEntry = async (payload: TimetableEntryPayload): Promise<TimetableEntry> => {
  try {
    const response = await api.post("/principal-timetable", payload);
    return response.data.entry as TimetableEntry;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to create timetable entry."));
  }
};

const updateEntry = async (
  timetableId: string,
  payload: TimetableEntryPayload
): Promise<TimetableEntry> => {
  try {
    const response = await api.put(`/principal-timetable/${encodeURIComponent(timetableId)}`, payload);
    return response.data.entry as TimetableEntry;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to update timetable entry."));
  }
};

const deleteEntry = async (timetableId: string): Promise<void> => {
  try {
    await api.delete(`/principal-timetable/${encodeURIComponent(timetableId)}`);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to delete timetable entry."));
  }
};

export default {
  getTimetableOptions,
  getTimetable,
  createEntry,
  updateEntry,
  deleteEntry,
};
