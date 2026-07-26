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

  /** Lista todos los usuarios con datos basicos + foto de perfil + CV score. */
  async listAll() {
    const query = `
      SELECT u.id, u.matricula_o_rfc, u.nombre_completo, u.correo_institucional,
             u.rol, u.carrera, u.cuatrimestre, u.activo, u.email_verificado, u.fecha_registro, p.url_foto,
             CASE WHEN p.id IS NULL THEN 0 ELSE (
                 (CASE WHEN p.titular_profesional IS NOT NULL AND p.titular_profesional <> '' AND p.biografia IS NOT NULL AND p.biografia <> '' THEN 1 ELSE 0 END)
               + (CASE WHEN EXISTS (SELECT 1 FROM EDUCACION e WHERE e.perfil_id = p.id) THEN 1 ELSE 0 END)
               + (CASE WHEN EXISTS (SELECT 1 FROM EXPERIENCIA_LABORAL x WHERE x.perfil_id = p.id) THEN 1 ELSE 0 END)
               + (CASE WHEN EXISTS (SELECT 1 FROM PERFIL_HABILIDADES h WHERE h.perfil_id = p.id) THEN 1 ELSE 0 END)
               + (CASE WHEN EXISTS (SELECT 1 FROM PROYECTOS_PORTAFOLIO pr WHERE pr.perfil_id = p.id) THEN 1 ELSE 0 END)
             ) * 20 END AS cv_score
      FROM USUARIOS u
      LEFT JOIN PERFILES p ON p.usuario_id = u.id
      ORDER BY u.fecha_registro DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  /** Perfil completo de un usuario para administracion (sin filtrar por activo). */
  async findByIdForAdmin(usuarioId: string): Promise<UserProfile | null> {
    const query = `
      SELECT id, matricula_o_rfc, nombre_completo, correo_institucional, rol,
             carrera, cuatrimestre, activo, email_verificado, fecha_registro
      FROM USUARIOS WHERE id = $1
    `;
    const result = await db.query(query, [usuarioId]);
    if (result.rows.length === 0) return null;
    const perfil = await this.findPerfilByUsuarioId(usuarioId);
    return { ...result.rows[0], perfil };
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

  /**
   * Estadisticas agregadas para el panel de administracion (graficas + resumen).
   */
  async dashboardStats() {
    const [tot, porCarrera, postMes, regMes, cv] = await Promise.all([
      db.query(`
        SELECT
          (SELECT count(*) FROM EMPRESAS) AS empresas,
          (SELECT count(*) FROM EMPRESAS WHERE activa) AS empresas_activas,
          (SELECT count(*) FROM USUARIOS WHERE rol = 'estudiante') AS usuarios,
          (SELECT count(*) FROM USUARIOS WHERE rol = 'estudiante' AND activo) AS usuarios_activos,
          (SELECT count(*) FROM VACANTES WHERE activa) AS vacantes_activas,
          (SELECT count(*) FROM POSTULACIONES) AS postulaciones
      `),
      db.query(`
        SELECT carrera, count(*)::int AS total
        FROM USUARIOS
        WHERE rol = 'estudiante' AND carrera IS NOT NULL
        GROUP BY carrera ORDER BY total DESC
      `),
      db.query(`
        SELECT to_char(date_trunc('month', fecha_postulacion), 'YYYY-MM') AS mes, count(*)::int AS total
        FROM POSTULACIONES
        WHERE fecha_postulacion >= (CURRENT_DATE - INTERVAL '6 months')
        GROUP BY 1 ORDER BY 1
      `),
      db.query(`
        SELECT to_char(date_trunc('month', fecha_registro), 'YYYY-MM') AS mes, count(*)::int AS total
        FROM USUARIOS
        WHERE rol = 'estudiante' AND fecha_registro >= (CURRENT_DATE - INTERVAL '6 months')
        GROUP BY 1 ORDER BY 1
      `),
      // CV score = % de secciones completas del perfil (5 secciones × 20 pts).
      db.query(`
        WITH perfil_score AS (
          SELECT (
              (CASE WHEN p.titular_profesional IS NOT NULL AND p.titular_profesional <> '' AND p.biografia IS NOT NULL AND p.biografia <> '' THEN 1 ELSE 0 END)
            + (CASE WHEN EXISTS (SELECT 1 FROM EDUCACION e WHERE e.perfil_id = p.id) THEN 1 ELSE 0 END)
            + (CASE WHEN EXISTS (SELECT 1 FROM EXPERIENCIA_LABORAL x WHERE x.perfil_id = p.id) THEN 1 ELSE 0 END)
            + (CASE WHEN EXISTS (SELECT 1 FROM PERFIL_HABILIDADES h WHERE h.perfil_id = p.id) THEN 1 ELSE 0 END)
            + (CASE WHEN EXISTS (SELECT 1 FROM PROYECTOS_PORTAFOLIO pr WHERE pr.perfil_id = p.id) THEN 1 ELSE 0 END)
          ) * 20 AS score
          FROM PERFILES p
          JOIN USUARIOS u ON u.id = p.usuario_id AND u.rol = 'estudiante' AND u.activo
        )
        SELECT
          COALESCE(ROUND(AVG(score)), 0)::int AS promedio,
          COUNT(*) FILTER (WHERE score >= 80)::int AS altos,
          COUNT(*) FILTER (WHERE score >= 50 AND score < 80)::int AS medios,
          COUNT(*) FILTER (WHERE score < 50)::int AS bajos,
          COUNT(*)::int AS total
        FROM perfil_score
      `),
    ]);

    const t = tot.rows[0];
    const c = cv.rows[0] || { promedio: 0, altos: 0, medios: 0, bajos: 0, total: 0 };
    return {
      totales: {
        empresas: parseInt(t.empresas, 10),
        empresasActivas: parseInt(t.empresas_activas, 10),
        usuarios: parseInt(t.usuarios, 10),
        usuariosActivos: parseInt(t.usuarios_activos, 10),
        vacantesActivas: parseInt(t.vacantes_activas, 10),
        postulaciones: parseInt(t.postulaciones, 10),
      },
      porCarrera: porCarrera.rows,
      postulacionesPorMes: postMes.rows,
      registrosPorMes: regMes.rows,
      cvScore: {
        promedio: c.promedio,
        altos: c.altos,
        medios: c.medios,
        bajos: c.bajos,
        total: c.total,
      },
    };
  }
}

export const usersDAO = new UsersDAO();
