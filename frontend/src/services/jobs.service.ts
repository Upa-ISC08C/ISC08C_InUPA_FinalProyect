import { api } from "./api";
import type { Vacante, Postulacion } from "./types";

export interface JobFilters {
  activa?: boolean;
  modalidad?: string;
  tipo_contrato?: string;
  nivel_experiencia?: string;
  ubicacion?: string;
  salario_min?: number;
  carrera?: string;
  cuatrimestre?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateVacanteDTOExtra {
  carreras?: string[];
  cuatrimestre?: number;
}

export interface CreateVacanteDTO {
  titulo: string;
  descripcion: string;
  requisitos?: string;
  empresa_id: string;
  salario_min?: number;
  salario_max?: number;
  modalidad?: string;
  tipo_contrato?: string;
  nivel_experiencia?: string;
  ubicacion?: string;
  carreras?: string[];
  cuatrimestre?: number;
  fecha_limite?: string;
  imagen_url?: string;
}

export const jobsService = {
  list(filters: JobFilters = {}) {
    return api
      .get<{ success: boolean; data: Vacante[]; pagination?: any }>("/jobs", { params: filters })
      .then((res) => res.data);
  },
  recent(limit = 6) {
    return api
      .get<{ success: boolean; data: Vacante[] }>(`/jobs/recent`, { params: { limit } })
      .then((res) => res.data.data);
  },
  getById(id: string) {
    return api.get<{ success: boolean; data: Vacante }>(`/jobs/${id}`).then((res) => res.data.data);
  },
  create(data: CreateVacanteDTO) {
    return api.post<{ success: boolean; data: Vacante }>("/jobs", data).then((res) => res.data.data);
  },
  update(id: string, data: Partial<CreateVacanteDTO> & { activa?: boolean }) {
    return api.put<{ success: boolean; data: Vacante }>(`/jobs/${id}`, data).then((res) => res.data.data);
  },
  remove(id: string) {
    return api.delete(`/jobs/${id}`).then((res) => res.data);
  },

  // Postulaciones del usuario autenticado
  apply(vacante_id: string) {
    return api
      .post<{ success: boolean; data: Postulacion }>("/applications", { vacante_id })
      .then((res) => res.data.data);
  },
  myApplications() {
    return api
      .get<{ success: boolean; data: Postulacion[] }>("/applications")
      .then((res) => res.data.data);
  },
};
