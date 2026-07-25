import api from '../../services/api';

export interface Company {
  id: string;
  nombre: string;
  industria: string;
  descripcion: string;
  sitio_web: string;
  correo_contacto: string;
  telefono: string;
  ciudad: string;
  direccion: string;
  tamano: string;
  activa: boolean;
  created_at: string;
}

export const companiesService = {
  async getCompanies(): Promise<{ success: boolean; data: Company[] }> {
    const response = await api.get('/companies');
    return response.data;
  },

  async createCompany(data: Partial<Company>): Promise<{ success: boolean; data: Company }> {
    const response = await api.post('/companies', data);
    return response.data;
  },

  async updateCompany(id: string, data: Partial<Company>): Promise<{ success: boolean; data: Company }> {
    const response = await api.put(`/companies/${id}`, data);
    return response.data;
  },

  async deleteCompany(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  },
};