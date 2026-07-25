import api from '../../services/api';
import type { UserStats, UserStatsResponse } from './user.types';
export type { UserStats, UserStatsResponse };


export const userService = {
  async getStats(): Promise<UserStatsResponse> {
    const response = await api.get('/user/stats');
    return response.data;
  },
};