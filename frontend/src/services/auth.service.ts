import api from './api';
import type { User, LoginResponse } from '../features/user/user.types';

export const authService = {
  async login(credentials: { 
    correo_institucional: string; 
    password: string 
  }): Promise<LoginResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async googleLogin(idToken: string): Promise<{ accessToken: string; user: User }> {
    const response = await api.post('/auth/google', { idToken });
    return response.data;
  },

  async requestToken(email: string): Promise<void> {
    const response = await api.post('/auth/request-token', { email });
    return response.data;
  },

  async verifyToken(email: string, token: string): Promise<{ accessToken: string; user: User }> {
    const response = await api.post('/auth/verify-token', { email, token });
    return response.data;
  },
};