import React from "react";
import { AdminModulePlaceholder } from "./AdminModulePlaceholder";

export const AdminCommunication = () => {
  const items=["Create announcement","Send parent notifications","Class-wise communication","Notice history","Message templates","Delivery status"];
  return <AdminModulePlaceholder title="Communication" subtitle="Send announcements and manage school communication" items={items} />;
}
