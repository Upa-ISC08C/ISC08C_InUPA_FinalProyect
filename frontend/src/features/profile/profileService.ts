import api from '../../services/api';
import type {
  FullProfile,
  Experiencia,
  Educacion,
  Proyecto,
  HabilidadPerfil,
  UpdateBasicsDTO,
} from './profile.types';

export type { FullProfile, Experiencia, Educacion, Proyecto, HabilidadPerfil, UpdateBasicsDTO };

export const profileService = {
  async getMyProfile(): Promise<FullProfile> {
    const res = await api.get('/profile/me');
    return res.data.data;
  },

  // Datos base (viven en USUARIOS + PERFILES) -> PUT /users/me
  async updateBasics(data: UpdateBasicsDTO) {
    const res = await api.put('/users/me', data);
    return res.data.data;
  },

  // Experiencia
  async addExperience(data: Partial<Experiencia>): Promise<Experiencia> {
    const res = await api.post('/profile/experience', data);
    return res.data.data;
  },
  async updateExperience(id: string, data: Partial<Experiencia>): Promise<Experiencia> {
    const res = await api.put(`/profile/experience/${id}`, data);
    return res.data.data;
  },
  async deleteExperience(id: string): Promise<void> {
    await api.delete(`/profile/experience/${id}`);
  },

  // Educación
  async addEducation(data: Partial<Educacion>): Promise<Educacion> {
    const res = await api.post('/profile/education', data);
    return res.data.data;
  },
  async updateEducation(id: string, data: Partial<Educacion>): Promise<Educacion> {
    const res = await api.put(`/profile/education/${id}`, data);
    return res.data.data;
  },
  async deleteEducation(id: string): Promise<void> {
    await api.delete(`/profile/education/${id}`);
  },

  // Proyectos
  async addProject(data: Partial<Proyecto>): Promise<Proyecto> {
    const res = await api.post('/profile/projects', data);
    return res.data.data;
  },
  async updateProject(id: string, data: Partial<Proyecto>): Promise<Proyecto> {
    const res = await api.put(`/profile/projects/${id}`, data);
    return res.data.data;
  },
  async deleteProject(id: string): Promise<void> {
    await api.delete(`/profile/projects/${id}`);
  },

  // Habilidades (el backend devuelve la lista actualizada al agregar)
  async addSkill(data: { nombre: string; nivel?: string }): Promise<HabilidadPerfil[]> {
    const res = await api.post('/profile/skills', data);
    return res.data.data;
  },
  async deleteSkill(id: string): Promise<void> {
    await api.delete(`/profile/skills/${id}`);
  },
};
