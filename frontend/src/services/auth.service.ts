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
};
