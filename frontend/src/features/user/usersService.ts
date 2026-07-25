import api from '../../services/api';
import type { User } from './user.types';
export type { User };

export const usersService = {
  async getUsers(): Promise<{ success: boolean; data: User[] }> {
    const response = await api.get('/users');
    return response.data;
  },

  async updateUser(id: string, data: Partial<User>): Promise<{ success: boolean; data: User }> {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};