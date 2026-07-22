import { connectionsDAO } from '../../daos/connections.dao';
import { CreateConnectionDTO, ConnectionFilters } from './connections.types';

export class ConnectionsService {
  static async createConnection(data: CreateConnectionDTO) {
    // Lógica de negocio: Validar que no se conecte consigo mismo
    if (data.follower_id === data.following_id) {
      throw new Error('No puedes conectarte contigo mismo');
    }

    // Delegar la operación de base de datos al DAO
    return connectionsDAO.createConnection(data);
  }

  static async getConnections(filters: ConnectionFilters) {
    return connectionsDAO.getConnections(filters);
  }

  static async deleteConnection(id: string) {
    return connectionsDAO.deleteConnection(id);
  }
}