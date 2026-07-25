import api from './api';
import type { User } from '../features/user/user.types';

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export const authService = {
  // Inicio de sesión clásico (correo institucional + contraseña)
  async login(credentials: {
    correo_institucional: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Registro clásico (crea la cuenta y devuelve sesión iniciada)
  async register(data: {
    nombre_completo: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async googleLogin(idToken: string): Promise<AuthResponse> {
    const response = await api.post('/auth/google', { idToken });
    return response.data;
  },

  // Acceso alternativo por código (OTP) — se mantiene disponible en el backend
  async requestToken(email: string): Promise<void> {
    const response = await api.post('/auth/request-token', { email });
    return response.data;
  },

  async verifyToken(email: string, token: string): Promise<AuthResponse> {
    const response = await api.post('/auth/verify-token', { email, token });
    return response.data;
  },
};
