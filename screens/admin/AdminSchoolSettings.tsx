import React from "react";
import { AdminModulePlaceholder } from "./AdminModulePlaceholder";

export const AdminSchoolSettings = () => {
  const items=["School profile","Academic years","Classes and sections","Fee configuration","Notification settings","Roles and permissions","Data and security settings"];
  return <AdminModulePlaceholder title="School Settings" subtitle="Configure school-wide settings and master data" items={items} />;
}
