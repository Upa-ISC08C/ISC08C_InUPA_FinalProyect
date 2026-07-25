import { profileDAO } from '../../daos/profile.dao';
import { usersDAO } from '../../daos/users.dao';
import {
  CreateExperienciaDTO,
  UpdateExperienciaDTO,
  CreateEducacionDTO,
  UpdateEducacionDTO,
  CreateProyectoDTO,
  UpdateProyectoDTO,
  AddHabilidadDTO,
} from './profile.types';
import { ValidationError, NotFoundError } from '../../shared/errors';

export class ProfileService {
  /** Perfil id del usuario autenticado (se crea el perfil si no existe). */
  private static async perfilId(usuarioId: string): Promise<string> {
    const perfil = await usersDAO.ensurePerfil(usuarioId);
    return perfil.id;
  }

  /** Agregado completo del perfil para la pantalla "Mi Perfil". */
  static async getMyProfile(usuarioId: string) {
    const user = await usersDAO.findById(usuarioId);
    if (!user) throw new NotFoundError('Usuario no encontrado');

    const perfil = user.perfil ?? (await usersDAO.ensurePerfil(usuarioId));
    const perfilId = perfil.id;

    const [experiencia, educacion, proyectos, habilidades] = await Promise.all([
      profileDAO.getExperiencias(perfilId),
      profileDAO.getEducaciones(perfilId),
      profileDAO.getProyectos(perfilId),
      profileDAO.getHabilidades(perfilId),
    ]);

    return {
      id: user.id,
      matricula_o_rfc: user.matricula_o_rfc,
      nombre_completo: user.nombre_completo,
      correo_institucional: user.correo_institucional,
      perfil,
      experiencia,
      educacion,
      proyectos,
      habilidades,
    };
  }

  // ---- EXPERIENCIA ----
  static async addExperiencia(usuarioId: string, d: CreateExperienciaDTO) {
    if (!d.puesto?.trim()) throw new ValidationError('El puesto es obligatorio');
    if (!d.fecha_inicio) throw new ValidationError('La fecha de inicio es obligatoria');
    return profileDAO.createExperiencia(await this.perfilId(usuarioId), d);
  }
  static async updateExperiencia(usuarioId: string, id: string, d: UpdateExperienciaDTO) {
    const upd = await profileDAO.updateExperiencia(id, await this.perfilId(usuarioId), d);
    if (!upd) throw new NotFoundError('Experiencia no encontrada');
    return upd;
  }
  static async deleteExperiencia(usuarioId: string, id: string) {
    const ok = await profileDAO.deleteItem('EXPERIENCIA_LABORAL', id, await this.perfilId(usuarioId));
    if (!ok) throw new NotFoundError('Experiencia no encontrada');
  }

  // ---- EDUCACION ----
  static async addEducacion(usuarioId: string, d: CreateEducacionDTO) {
    if (!d.institucion?.trim()) throw new ValidationError('La institución es obligatoria');
    if (!d.carrera_o_grado?.trim()) throw new ValidationError('La carrera o grado es obligatorio');
    if (!d.fecha_inicio) throw new ValidationError('La fecha de inicio es obligatoria');
    return profileDAO.createEducacion(await this.perfilId(usuarioId), d);
  }
  static async updateEducacion(usuarioId: string, id: string, d: UpdateEducacionDTO) {
    const upd = await profileDAO.updateEducacion(id, await this.perfilId(usuarioId), d);
    if (!upd) throw new NotFoundError('Educación no encontrada');
    return upd;
  }
  static async deleteEducacion(usuarioId: string, id: string) {
    const ok = await profileDAO.deleteItem('EDUCACION', id, await this.perfilId(usuarioId));
    if (!ok) throw new NotFoundError('Educación no encontrada');
  }

  // ---- PROYECTOS ----
  static async addProyecto(usuarioId: string, d: CreateProyectoDTO) {
    if (!d.nombre_proyecto?.trim()) throw new ValidationError('El nombre del proyecto es obligatorio');
    return profileDAO.createProyecto(await this.perfilId(usuarioId), d);
  }
  static async updateProyecto(usuarioId: string, id: string, d: UpdateProyectoDTO) {
    const upd = await profileDAO.updateProyecto(id, await this.perfilId(usuarioId), d);
    if (!upd) throw new NotFoundError('Proyecto no encontrado');
    return upd;
  }
  static async deleteProyecto(usuarioId: string, id: string) {
    const ok = await profileDAO.deleteItem('PROYECTOS_PORTAFOLIO', id, await this.perfilId(usuarioId));
    if (!ok) throw new NotFoundError('Proyecto no encontrado');
  }

  // ---- HABILIDADES ----
  static async addHabilidad(usuarioId: string, d: AddHabilidadDTO) {
    const nombre = d.nombre?.trim();
    if (!nombre) throw new ValidationError('El nombre de la habilidad es obligatorio');
    const perfilId = await this.perfilId(usuarioId);
    const habilidadId = await profileDAO.findOrCreateHabilidad(nombre);
    await profileDAO.addHabilidad(perfilId, habilidadId, d.nivel, d.anos_experiencia);
    // Devolvemos la lista actualizada para simplificar el frontend.
    return profileDAO.getHabilidades(perfilId);
  }
  static async deleteHabilidad(usuarioId: string, id: string) {
    const ok = await profileDAO.deleteHabilidad(id, await this.perfilId(usuarioId));
    if (!ok) throw new NotFoundError('Habilidad no encontrada');
  }
}
