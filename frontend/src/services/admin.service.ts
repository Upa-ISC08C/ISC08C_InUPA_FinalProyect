import { api } from "./api";
import type { AdminUser } from "./types";

export type { AdminUser };

export const adminService = {
  listUsers() {
    return api.get<{ success: boolean; data: AdminUser[] }>("/users").then((res) => res.data.data);
  },
  updateUser(id: string, data: { activo?: boolean; rol?: string; nombre_completo?: string }) {
    return api.put<{ success: boolean; data: AdminUser }>(`/users/${id}`, data).then((res) => res.data.data);
  },
  removeUser(id: string) {
    return api.delete(`/users/${id}`).then((res) => res.data);
  },
};
