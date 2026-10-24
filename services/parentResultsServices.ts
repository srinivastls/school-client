import { api } from "./client";

const getChildren = async () => {
  const response = await api.get("/parent/results/children");
  return response.data?.children ?? [];
};

const getStudentResults = async (studentId: string) => {
  const response = await api.get("/parent/results", { params: { studentId } });
  return response.data;
};

export const parentResultsServices = { getChildren, getStudentResults };
export default parentResultsServices;
