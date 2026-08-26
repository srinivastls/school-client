import { api } from "./client";

/* ============================================================
   TYPES
============================================================ */

export type ParentChild = {
  id: string;

  admissionNo: string;

  name: string;

  phone?: string | null;

  status: string;

  relationship:
    | "FATHER"
    | "MOTHER"
    | "GUARDIAN";

  isPrimary: boolean;

  class: {
    id: string;
    classNumber: string;
    displayName: string;
  };

  section: {
    id: string;
    sectionName: string;
  };
};


export type ParentProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
};


export type ParentDashboardResponse = {
  parent: ParentProfile;

  children: ParentChild[];
};


/* ============================================================
   ENDPOINTS
============================================================ */

const endpoints = {

  /*
   * Parent dashboard
   *
   * Returns:
   * {
   *   parent: {...},
   *   children: [...]
   * }
   */
  dashboard:
    "/parent/dashboard",

};


/* ============================================================
   GET PARENT DASHBOARD
============================================================ */

const getDashboard =
  async (): Promise<ParentDashboardResponse> => {

    const response =
      await api.get(
        endpoints.dashboard
      );

    return response.data;
  };


/* ============================================================
   GET CHILDREN
============================================================ */

const getChildren =
  async (): Promise<ParentChild[]> => {

    const response =
      await api.get(
        endpoints.dashboard
      );

    return (
      response.data?.children ??
      []
    );
  };


/* ============================================================
   EXPORT
============================================================ */

export const parentServices = {

  getDashboard,

  getChildren,

};