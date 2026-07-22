import { applicationsDAO } from '../../daos/applications.dao';

export class ApplicationsService {
  static async getMyApplications(userId: string) {
    return applicationsDAO.getMyApplications(userId);
  }

  static async createApplication(userId: string, vacanteId: string) {
    return applicationsDAO.createApplication(userId, vacanteId);
  }

  static async getApplicationById(id: string) {
    return applicationsDAO.getApplicationById(id);
  }
}
