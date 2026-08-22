import { useUserStore } from "../store";
import { Admin, Roles } from "../types";

export const isUserSuperAdmin = (
  user: Admin | null = useUserStore.getState().user
) => {
  return user?.roles.includes(Roles.superadmin);
};
