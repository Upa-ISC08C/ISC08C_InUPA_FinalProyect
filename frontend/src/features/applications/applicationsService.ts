import api from '../../services/api';
import type { Application, ApplicationsResponse } from './applications.types';

export type { Application, ApplicationsResponse };

export const applicationsService = {
  async getMyApplications(): Promise<ApplicationsResponse> {
    const response = await api.get('/applications');
    return response.data;
  },

  async createApplication(vacante_id: string): Promise<{ success: boolean; data: Application }> {
    const response = await api.post('/applications', { vacante_id });
    return response.data;
  },

  async getApplicationById(id: string): Promise<{ success: boolean; data: Application }> {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },
};