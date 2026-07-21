import api from './api';

export const authService = {
  /**
   * Solicita el envío del código OTP al correo proporcionado
   */
  requestToken: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/request-token', { email });
    return response.data;
  },

  /**
   * Verifica el código OTP y devuelve el accessToken
   */
  verifyToken: async (email: string, token: string): Promise<{ message: string; accessToken: string }> => {
    const response = await api.post('/auth/verify-token', { email, token });
    return response.data;
  },

  /**
   * Inicia sesión con el ID token que devuelve Google Identity Services
   */
  googleLogin: async (idToken: string): Promise<{ message: string; accessToken: string }> => {
    const response = await api.post('/auth/google', { idToken });
    return response.data;
  },
};
