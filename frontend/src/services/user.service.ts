import { api } from "./api";
import type { UserStats } from "./types";

export interface UpdateProfileDTO {
  nombre_completo?: string;
  titular_profesional?: string;
  biografia?: string;
  url_foto?: string;
  github_url?: string;
  linkedin_url?: string;
  telefono?: string;
  ubicacion?: string;
  nivel_experiencia?: string;
  disponibilidad?: boolean;
  buscando_empleo?: boolean;
}

export const userService = {
  me() {
    return api.get<{ success: boolean; data: any }>("/users/me").then((res) => res.data.data);
  },
  updateMe(payload: UpdateProfileDTO) {
    return api.put<{ success: boolean; data: any }>("/users/me", payload).then((res) => res.data.data);
  },
  stats() {
    return api.get<{ success: boolean; data: UserStats }>("/user/stats").then((res) => res.data.data);
  },
};
