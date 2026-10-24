import { api } from "./client";
export type TeacherReportCardOptions = { academicYear: { id: string; name: string }; exams: Array<{ id: string; name: string; type: string; termNumber: number; isPublished: boolean; examSubjects: Array<{ classId: string }> }>; sections: Array<{ id: string; sectionName: string; classId: string; class: { id: string; classNumber: string; displayName: string } }> };
export type TeacherReportCardPreview = import("./principalReportCardServices").ReportCardPreview & { section: { id: string; sectionName: string } };
const getOptions = async (academicYearId: string): Promise<TeacherReportCardOptions> => (await api.get("/teacher-report-cards/options", { params: { academicYearId } })).data;
const getPreview = async (academicYearId: string, examId: string, sectionId: string): Promise<TeacherReportCardPreview> => (await api.get("/teacher-report-cards/preview", { params: { academicYearId, examId, sectionId } })).data;
export const teacherReportCardServices = { getOptions, getPreview };
export default teacherReportCardServices;
