import { api } from "./api";
import type { AuthResponse } from "./types";

export const authService = {
  // Inicio de sesión clásico (correo institucional + contraseña)
  login(correo_institucional: string, password: string) {
    return api
      .post<AuthResponse>("/auth/login", { correo_institucional, password })
      .then((res) => res.data);
  },

  // Registro (crea la cuenta y devuelve sesión iniciada)
  register(data: {
    nombre_completo: string;
    email: string;
    password: string;
    matricula_o_rfc?: string;
    carrera?: string;
    cuatrimestre?: number;
  }) {
    return api.post<AuthResponse>("/auth/register", data).then((res) => res.data);
  },

  googleLogin(idToken: string) {
    return api
      .post<AuthResponse>("/auth/google", { idToken })
      .then((res) => res.data);
  },

  // Acceso alternativo por código (OTP) — disponible en el backend
  requestToken(email: string) {
    return api.post("/auth/request-token", { email }).then((res) => res.data);
  },
  verifyToken(email: string, token: string) {
    return api
      .post<AuthResponse>("/auth/verify-token", { email, token })
      .then((res) => res.data);
  },

  // Recuperación de contraseña por código enviado al correo
  forgotPassword(email: string) {
    return api.post<{ message: string }>("/auth/forgot-password", { email }).then((res) => res.data);
  },
  resetPassword(email: string, token: string, password: string) {
    return api.post<{ message: string }>("/auth/reset-password", { email, token, password }).then((res) => res.data);
  },

  // Verificación de correo
  verifyEmail(email: string, token: string) {
    return api.post<{ message: string }>("/auth/verify-email", { email, token }).then((res) => res.data);
  },
  resendVerification(email: string) {
    return api.post<{ message: string }>("/auth/resend-verification", { email }).then((res) => res.data);
  },
};
