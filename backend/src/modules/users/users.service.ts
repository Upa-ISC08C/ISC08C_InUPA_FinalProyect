import { usersDAO } from '../../daos/users.dao';
import { jobsDAO } from '../../daos/jobs.dao';
import { authService } from '../auth/auth.service';
import { UserProfile, UpdateUserProfileDTO } from './users.types';
import { ValidationError, NotFoundError } from '../../shared/errors';

const URL_REGEX = /^https?:\/\/.+/i;

export class UsersService {
  /**
   * Perfil del usuario autenticado. Crea el perfil vacio la primera vez
   * para que el frontend siempre reciba la misma forma de objeto.
   */
  static async getProfile(usuarioId: string): Promise<UserProfile> {
    const user = await usersDAO.findById(usuarioId);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    if (!user.perfil) {
      user.perfil = await usersDAO.ensurePerfil(usuarioId);
    }

    return user;
  }

  /**
   * Actualiza el perfil del usuario autenticado.
   * Valida antes de tocar la base de datos.
   */
  static async updateProfile(usuarioId: string, data: UpdateUserProfileDTO): Promise<UserProfile> {
    this.validar(data);

    const user = await usersDAO.findById(usuarioId);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return usersDAO.updateProfile(usuarioId, data);
  }

  // ---------------------------------------------------------------------------
  // Estadisticas del dashboard del estudiante
  // ---------------------------------------------------------------------------
  static async getStats(usuarioId: string) {
    const stats = await usersDAO.getStats(usuarioId);
    // Trabajos recomendados: por ahora, las vacantes activas mas recientes.
    const recommendedJobs = await jobsDAO.getRecentVacantes(3);
    return { ...stats, recommendedJobs };
  }

  // ---------------------------------------------------------------------------
  // Administracion (solo admin)
  // ---------------------------------------------------------------------------
  static async listAll() {
    return usersDAO.listAll();
  }

  static async adminDashboard() {
    return usersDAO.dashboardStats();
  }

  static async adminUpdate(
    id: string,
    data: { activo?: boolean; rol?: string; nombre_completo?: string }
  ) {
    if (data.rol !== undefined && !['estudiante', 'admin'].includes(data.rol)) {
      throw new ValidationError('El rol debe ser "estudiante" o "admin"');
    }
    const user = await usersDAO.adminUpdate(id, data);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }
    return user;
  }

  /** Admin dispara el flujo de restablecimiento: envía un código al correo del usuario. */
  static async adminResetPassword(id: string) {
    const user = await usersDAO.findById(id);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }
    await authService.forgotPassword(user.correo_institucional);
    return user.correo_institucional;
  }

  static async adminRemove(id: string) {
    const ok = await usersDAO.adminSoftDelete(id);
    if (!ok) {
      throw new NotFoundError('Usuario no encontrado');
    }
    return true;
  }

  private static validar(data: UpdateUserProfileDTO): void {
    if (Object.keys(data).length === 0) {
      throw new ValidationError('No se enviaron campos para actualizar');
    }

    if (data.nombre_completo !== undefined) {
      const nombre = data.nombre_completo.trim();
      if (nombre.length < 3) {
        throw new ValidationError('El nombre completo debe tener al menos 3 caracteres');
      }
      if (nombre.length > 200) {
        throw new ValidationError('El nombre completo no puede exceder 200 caracteres');
      }
    }

    if (data.telefono !== undefined && data.telefono !== '' && !/^[\d+\-\s()]{7,20}$/.test(data.telefono)) {
      throw new ValidationError('El telefono no tiene un formato valido');
    }

    // La foto puede venir como URL http(s) o como imagen subida (data URI base64).
    if (data.url_foto !== undefined && data.url_foto !== '' &&
        !URL_REGEX.test(data.url_foto) && !data.url_foto.startsWith('data:image/')) {
      throw new ValidationError('La foto debe ser una URL válida o una imagen subida');
    }
    for (const campo of ['github_url', 'linkedin_url'] as const) {
      const valor = data[campo];
      if (valor !== undefined && valor !== '' && !URL_REGEX.test(valor)) {
        throw new ValidationError(`El campo ${campo} debe ser una URL valida (http/https)`);
      }
    }

    if (data.biografia !== undefined && data.biografia.length > 2000) {
      throw new ValidationError('La biografia no puede exceder 2000 caracteres');
    }
  }
}
