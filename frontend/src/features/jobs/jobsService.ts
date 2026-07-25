import api from '../../services/api';
import type { Job, JobsResponse, JobFilters } from './jobs.types';

// Exportar tipos para que AdminVacantes pueda usarlos
export type { Job, JobsResponse, JobFilters };

export interface CreateVacanteDTO {
  titulo: string;
  descripcion: string;
  requisitos: string;
  empresa_id: string;
  url_origen?: string;
  salario_min?: number;
  salario_max?: number;
  modalidad?: string;
  tipo_contrato?: string;
  nivel_experiencia?: string;
  ubicacion?: string;
  fecha_limite?: string;
}

export const jobsService = {
  async getJobs(filters: JobFilters = {}): Promise<JobsResponse> {
    const params = new URLSearchParams();
    if (filters.activa !== undefined) params.append('activa', filters.activa.toString());
    if (filters.modalidad) params.append('modalidad', filters.modalidad);
    if (filters.tipo_contrato) params.append('tipo_contrato', filters.tipo_contrato);
    if (filters.nivel_experiencia) params.append('nivel_experiencia', filters.nivel_experiencia);
    if (filters.ubicacion) params.append('ubicacion', filters.ubicacion);
    if (filters.salario_min) params.append('salario_min', filters.salario_min.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/jobs?${params.toString()}`);
    return response.data;
  },

  async getRecentJobs(limit: number = 10): Promise<JobsResponse> {
    const response = await api.get(`/jobs/recent?limit=${limit}`);
    return response.data;
  },

  async getJobById(id: string): Promise<{ success: boolean; data: Job }> {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // MÉTODOS NUEVOS PARA ADMIN
  async createVacante(data: CreateVacanteDTO): Promise<{ success: boolean; data: Job }> {
    const response = await api.post('/jobs', data);
    return response.data;
  },

  async updateVacante(id: string, data: Partial<CreateVacanteDTO>): Promise<{ success: boolean; data: Job }> {
    const response = await api.put(`/jobs/${id}`, data);
    return response.data;
  },

  async deleteVacante(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },
};