import { usersDAO } from '../../daos/users.dao';
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

    for (const campo of ['url_foto', 'github_url', 'linkedin_url'] as const) {
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
