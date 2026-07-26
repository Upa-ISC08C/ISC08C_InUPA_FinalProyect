import { api } from "./api";
import type { AdminUser } from "./types";

export type { AdminUser };

export interface AdminDashboard {
  totales: { empresas: number; empresasActivas: number; usuarios: number; usuariosActivos: number; vacantesActivas: number; postulaciones: number };
  porCarrera: { carrera: string; total: number }[];
  postulacionesPorMes: { mes: string; total: number }[];
  registrosPorMes: { mes: string; total: number }[];
  cvScore: { promedio: number; altos: number; medios: number; bajos: number; total: number };
}

export interface AdminUserDetail {
  id: string;
  matricula_o_rfc: string;
  nombre_completo: string;
  correo_institucional: string;
  rol: string;
  carrera: string | null;
  cuatrimestre: number | null;
  activo: boolean;
  email_verificado?: boolean;
  fecha_registro: string;
  perfil: {
    titular_profesional?: string | null;
    biografia?: string | null;
    telefono?: string | null;
    ubicacion?: string | null;
    url_foto?: string | null;
    github_url?: string | null;
    linkedin_url?: string | null;
  } | null;
}

export const adminService = {
  dashboard() {
    return api.get<{ success: boolean; data: AdminDashboard }>("/users/dashboard/admin").then((res) => res.data.data);
  },
  listUsers() {
    return api.get<{ success: boolean; data: AdminUser[] }>("/users").then((res) => res.data.data);
  },
  getUser(id: string) {
    return api.get<{ success: boolean; data: AdminUserDetail }>(`/users/${id}`).then((res) => res.data.data);
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
