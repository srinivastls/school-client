import { useUserStore } from "../store";

import { SchoolUser } from "../types";

/* ============================================================
   CURRENT USER
============================================================ */

export const getCurrentUser = (): SchoolUser | null => {
  const user = useUserStore.getState().user;

  if (!user || user.role === "PLATFORM_ADMIN") {
    return null;
  }

  return user as SchoolUser;
};

/* ============================================================
   SCHOOL ROLES
============================================================ */

export const isPrincipal = (
  user: SchoolUser | null = getCurrentUser()
): boolean => {
  return user?.role === "PRINCIPAL";
};

export const isAdmin = (
  user: SchoolUser | null = getCurrentUser()
): boolean => {
  return (
    user?.role === "ADMIN" ||
    user?.role === "PRINCIPAL"
  );
};

export const isTeacher = (
  user: SchoolUser | null = getCurrentUser()
): boolean => {
  return user?.role === "TEACHER";
};

export const isParent = (
  user: SchoolUser | null = getCurrentUser()
): boolean => {
  return user?.role === "PARENT";
};

/* ============================================================
   SCHOOL USER
============================================================ */

export const isSchoolUser = (
  user: SchoolUser | null = getCurrentUser()
): boolean => {
  return !!user;
};