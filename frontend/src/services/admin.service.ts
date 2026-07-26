import { api } from "./api";
import type { AdminUser } from "./types";

export type { AdminUser };

export interface AdminDashboard {
  totales: { empresas: number; empresasActivas: number; usuarios: number; usuariosActivos: number; vacantesActivas: number; postulaciones: number };
  porCarrera: { carrera: string; total: number }[];
  postulacionesPorMes: { mes: string; total: number }[];
  registrosPorMes: { mes: string; total: number }[];
}

export const adminService = {
  dashboard() {
    return api.get<{ success: boolean; data: AdminDashboard }>("/users/dashboard/admin").then((res) => res.data.data);
  },
  listUsers() {
    return api.get<{ success: boolean; data: AdminUser[] }>("/users").then((res) => res.data.data);
  },
  updateUser(id: string, data: { activo?: boolean; rol?: string; nombre_completo?: string }) {
    return api.put<{ success: boolean; data: AdminUser }>(`/users/${id}`, data).then((res) => res.data.data);
  },
  removeUser(id: string) {
    return api.delete(`/users/${id}`).then((res) => res.data);
  },
  resetPassword(id: string) {
    return api.post<{ success: boolean; message: string }>(`/users/${id}/reset-password`).then((res) => res.data);
  },
};
