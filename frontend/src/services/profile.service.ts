import { api } from "./api";

// Perfil profesional completo (estilo LinkedIn) del usuario autenticado.
export interface FullProfile {
  id: string;
  matricula_o_rfc: string;
  nombre_completo: string;
  correo_institucional: string;
  carrera: string | null;
  cuatrimestre: number | null;
  perfil: any;
  experiencia: any[];
  educacion: any[];
  proyectos: any[];
  habilidades: any[];
}

export const profileService = {
  getMyProfile() {
    return api.get<{ success: boolean; data: FullProfile }>("/profile/me").then((r) => r.data.data);
  },

  // Experiencia
  addExperience(data: any) {
    return api.post("/profile/experience", data).then((r) => r.data.data);
  },
  updateExperience(id: string, data: any) {
    return api.put(`/profile/experience/${id}`, data).then((r) => r.data.data);
  },
  deleteExperience(id: string) {
    return api.delete(`/profile/experience/${id}`).then((r) => r.data);
  },

  // Educación
  addEducation(data: any) {
    return api.post("/profile/education", data).then((r) => r.data.data);
  },
  updateEducation(id: string, data: any) {
    return api.put(`/profile/education/${id}`, data).then((r) => r.data.data);
  },
  deleteEducation(id: string) {
    return api.delete(`/profile/education/${id}`).then((r) => r.data);
  },

  // Proyectos
  addProject(data: any) {
    return api.post("/profile/projects", data).then((r) => r.data.data);
  },
  updateProject(id: string, data: any) {
    return api.put(`/profile/projects/${id}`, data).then((r) => r.data.data);
  },
  deleteProject(id: string) {
    return api.delete(`/profile/projects/${id}`).then((r) => r.data);
  },

  // Habilidades (el backend devuelve la lista actualizada al agregar)
  addSkill(data: { nombre: string; nivel?: string }) {
    return api.post("/profile/skills", data).then((r) => r.data.data);
  },
  deleteSkill(id: string) {
    return api.delete(`/profile/skills/${id}`).then((r) => r.data);
  },
};
