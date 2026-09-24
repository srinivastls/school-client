import React from "react";
import { AdminModulePlaceholder } from "./AdminModulePlaceholder";

export const AdminReports = () => {
  const items=["Student report","Fee collection report","Pending fee report","Attendance report","Staff report","Academic performance report","CSV/PDF export history"];
  return <AdminModulePlaceholder title="Reports & Exports" subtitle="Generate operational and academic reports" items={items} />;
}
