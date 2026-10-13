import React from "react";
import { AdminModulePlaceholder } from "./AdminModulePlaceholder";

export const AdminAttendanceCalendar = () => {
  const items=["Daily student attendance","Teacher attendance","Leave calendar","Holiday calendar","Attendance corrections","Monthly attendance export"];
  return <AdminModulePlaceholder title="Attendance & Calendar" subtitle="Track attendance, leave and academic dates" items={items} />;
}
