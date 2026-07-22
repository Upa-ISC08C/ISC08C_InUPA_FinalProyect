import { db } from '../config/db';
import {
  UserProfile,
  Perfil,
  UpdateUserProfileDTO,
  CAMPOS_PERFIL_EDITABLES,
} from '../modules/users/users.types';

export class UsersDAO {
  /**
   * Devuelve el usuario con su perfil. Nunca incluye password_hash.
   */
  async findById(usuarioId: string): Promise<UserProfile | null> {
    const query = `
      SELECT id, matricula_o_rfc, nombre_completo, correo_institucional, activo, fecha_registro
      FROM USUARIOS
      WHERE id = $1 AND activo = true
    `;
    const result = await db.query(query, [usuarioId]);

    if (result.rows.length === 0) {
      return null;
    }

    const perfil = await this.findPerfilByUsuarioId(usuarioId);

    return { ...result.rows[0], perfil };
  }

  /**
   * Obtiene el perfil de un usuario (puede no existir todavia).
   */
  async findPerfilByUsuarioId(usuarioId: string): Promise<Perfil | null> {
    const query = `SELECT * FROM PERFILES WHERE usuario_id = $1`;
    const result = await db.query(query, [usuarioId]);
    return result.rows[0] || null;
  }

  /**
   * Crea el perfil vacio de un usuario si aun no existe (idempotente).
   */
  async ensurePerfil(usuarioId: string): Promise<Perfil> {
    const existente = await this.findPerfilByUsuarioId(usuarioId);
    if (existente) {
      return existente;
    }

    const query = `INSERT INTO PERFILES (usuario_id) VALUES ($1) RETURNING *`;
    const result = await db.query(query, [usuarioId]);
    return result.rows[0];
  }

  /**
   * Actualiza el nombre en USUARIOS y los campos del perfil en PERFILES.
   * Solo se aceptan los campos de la whitelist: asi el cliente no puede tocar
   * columnas sensibles (correo, matricula, activo) aunque las mande en el body.
   */
  async updateProfile(usuarioId: string, data: UpdateUserProfileDTO): Promise<UserProfile> {
    // 1) El nombre completo vive en USUARIOS
    if (data.nombre_completo !== undefined) {
      await db.query(
        `UPDATE USUARIOS SET nombre_completo = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [data.nombre_completo, usuarioId]
      );
    }

    // 2) El resto vive en PERFILES (se crea si no existe)
    await this.ensurePerfil(usuarioId);

    const sets: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const campo of CAMPOS_PERFIL_EDITABLES) {
      const valor = (data as Record<string, unknown>)[campo];
      if (valor !== undefined) {
        sets.push(`${campo} = $${paramIndex++}`);
        values.push(valor);
      }
    }

    if (sets.length > 0) {
      values.push(usuarioId);
      await db.query(
        `UPDATE PERFILES SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE usuario_id = $${paramIndex}`,
        values
      );
    }

    const actualizado = await this.findById(usuarioId);
    if (!actualizado) {
      throw new Error('Usuario no encontrado despues de actualizar');
    }
    return actualizado;
  }
}

export const usersDAO = new UsersDAO();
