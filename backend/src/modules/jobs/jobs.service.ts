import { jobsDAO } from '../../daos/jobs.dao';
import { CreateVacanteDTO, UpdateVacanteDTO, VacanteFilters, VacanteWithRelations } from './jobs.types';

export class JobsService {
  static async createVacante(data: CreateVacanteDTO): Promise<VacanteWithRelations> {
    return jobsDAO.createVacante(data);
  }

  static async getVacantes(filters: VacanteFilters) {
    return jobsDAO.getVacantes(filters);
  }

  static async getRecentVacantes(limit: number = 10) {
    return jobsDAO.getRecentVacantes(limit);
  }

  static async getVacanteById(id: string): Promise<VacanteWithRelations | null> {
    return jobsDAO.getVacanteById(id);
  }

  static async updateVacante(id: string, data: UpdateVacanteDTO): Promise<VacanteWithRelations> {
    return jobsDAO.updateVacante(id, data);
  }

  static async deleteVacante(id: string): Promise<boolean> {
    return jobsDAO.deleteVacante(id);
  }
}