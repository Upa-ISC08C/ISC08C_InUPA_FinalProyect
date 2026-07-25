import api from '../../services/api';
import type { Connection, ConnectionsResponse, CreateConnectionDTO } from './connections.types';

export type { Connection, ConnectionsResponse, CreateConnectionDTO };

export const connectionsService = {
  async getConnections(follower_id?: string): Promise<ConnectionsResponse> {
    const params = follower_id ? `?follower_id=${follower_id}` : '';
    const response = await api.get(`/connections${params}`);
    return response.data;
  },

  async createConnection(data: CreateConnectionDTO): Promise<{ success: boolean; data: Connection }> {
    const response = await api.post('/connections', data);
    return response.data;
  },

  async deleteConnection(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/connections/${id}`);
    return response.data;
  },
};