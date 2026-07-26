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
      SELECT id, matricula_o_rfc, nombre_completo, correo_institucional, rol,
             carrera, cuatrimestre, activo, fecha_registro
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
    // 1) Datos que viven en USUARIOS (nombre, carrera, cuatrimestre)
    const usuarioSets: string[] = [];
    const usuarioVals: any[] = [];
    let ui = 1;
    if (data.nombre_completo !== undefined) { usuarioSets.push(`nombre_completo = $${ui++}`); usuarioVals.push(data.nombre_completo); }
    if (data.carrera !== undefined) { usuarioSets.push(`carrera = $${ui++}`); usuarioVals.push(data.carrera); }
    if (data.cuatrimestre !== undefined) { usuarioSets.push(`cuatrimestre = $${ui++}`); usuarioVals.push(data.cuatrimestre); }
    if (usuarioSets.length > 0) {
      usuarioVals.push(usuarioId);
      await db.query(
        `UPDATE USUARIOS SET ${usuarioSets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${ui}`,
        usuarioVals
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

  // =========================================================================
  // ADMINISTRACION (solo accesible por administradores)
  // =========================================================================

  /** Lista todos los usuarios con datos basicos + foto de perfil. */
  async listAll() {
    const query = `
      SELECT u.id, u.matricula_o_rfc, u.nombre_completo, u.correo_institucional,
             u.rol, u.carrera, u.cuatrimestre, u.activo, u.fecha_registro, p.url_foto
      FROM USUARIOS u
      LEFT JOIN PERFILES p ON p.usuario_id = u.id
      ORDER BY u.fecha_registro DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  /** Actualiza campos administrables de un usuario (activo, rol, nombre). */
  async adminUpdate(
    id: string,
    data: { activo?: boolean; rol?: string; nombre_completo?: string }
  ) {
    const sets: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (data.activo !== undefined) {
      sets.push(`activo = $${i++}`);
      values.push(data.activo);
    }
    if (data.rol !== undefined) {
      sets.push(`rol = $${i++}`);
      values.push(data.rol);
    }
    if (data.nombre_completo !== undefined) {
      sets.push(`nombre_completo = $${i++}`);
      values.push(data.nombre_completo);
    }

    if (sets.length === 0) {
      const actual = await db.query(
        `SELECT id, matricula_o_rfc, nombre_completo, correo_institucional, rol, activo, fecha_registro
         FROM USUARIOS WHERE id = $1`,
        [id]
      );
      return actual.rows[0] || null;
    }

    values.push(id);
    const result = await db.query(
      `UPDATE USUARIOS SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${i}
       RETURNING id, matricula_o_rfc, nombre_completo, correo_institucional, rol, activo, fecha_registro`,
      values
    );
    return result.rows[0] || null;
  }

  /** Borrado suave: desactiva la cuenta. */
  async adminSoftDelete(id: string): Promise<boolean> {
    const result = await db.query(
      `UPDATE USUARIOS SET activo = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  // =========================================================================
  // ESTADISTICAS DEL DASHBOARD DEL ESTUDIANTE
  // =========================================================================

  /**
   * Calcula las metricas que muestra el dashboard del estudiante:
   * total de postulaciones, desglose por estado y avance del CV.
   */
  async getStats(usuarioId: string) {
    const perfil = await this.ensurePerfil(usuarioId);

    const [postulaciones, educacion, experiencia, habilidades, proyectos] = await Promise.all([
      db.query(`SELECT estado FROM POSTULACIONES WHERE perfil_id = $1`, [perfil.id]),
      db.query(`SELECT COUNT(*)::int AS n FROM EDUCACION WHERE perfil_id = $1`, [perfil.id]),
      db.query(`SELECT COUNT(*)::int AS n FROM EXPERIENCIA_LABORAL WHERE perfil_id = $1`, [perfil.id]),
      db.query(`SELECT COUNT(*)::int AS n FROM PERFIL_HABILIDADES WHERE perfil_id = $1`, [perfil.id]),
      db.query(`SELECT COUNT(*)::int AS n FROM PROYECTOS_PORTAFOLIO WHERE perfil_id = $1`, [perfil.id]),
    ]);

    const applicationsByState: Record<string, number> = {};
    for (const row of postulaciones.rows) {
      applicationsByState[row.estado] = (applicationsByState[row.estado] || 0) + 1;
    }

    const education = educacion.rows[0].n as number;
    const experience = experiencia.rows[0].n as number;
    const skills = habilidades.rows[0].n as number;
    const projects = proyectos.rows[0].n as number;
    const basics = Boolean(perfil.titular_profesional && perfil.biografia);

    // Avance del CV: 5 secciones ponderadas por igual.
    const secciones = [basics, education > 0, experience > 0, skills > 0, projects > 0];
    const cvCompletion = Math.round((secciones.filter(Boolean).length / secciones.length) * 100);

    return {
      totalApplications: postulaciones.rows.length,
      applicationsByState,
      cvCompletion,
      cvDetails: { basics, education, experience, skills, projects },
    };
  }
}

export const usersDAO = new UsersDAO();
