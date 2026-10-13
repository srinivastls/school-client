import React from "react";
import { AdminModulePlaceholder } from "./AdminModulePlaceholder";

export const AdminStaffManagement = () => {
  const items=["Staff directory","Teacher attendance","Leave approvals","Role and permission management","Staff onboarding","Staff reports"];
  return <AdminModulePlaceholder title="Staff Administration" subtitle="Manage teachers, employees, roles and attendance" items={items} />;
}
