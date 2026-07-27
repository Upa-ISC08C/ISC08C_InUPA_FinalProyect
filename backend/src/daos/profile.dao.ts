import { db } from '../config/db';
import {
  CreateExperienciaDTO,
  UpdateExperienciaDTO,
  CreateEducacionDTO,
  UpdateEducacionDTO,
  CreateProyectoDTO,
  UpdateProyectoDTO,
} from '../modules/profile/profile.types';

/**
 * DAO del perfil profesional (estilo LinkedIn): experiencia, educacion,
 * proyectos y habilidades. Todo opera SIEMPRE acotado al perfil_id del
 * usuario autenticado (ownership dentro del WHERE).
 */
export class ProfileDAO {
  // -------------------------------------------------------------------------
  // EXPERIENCIA LABORAL
  // -------------------------------------------------------------------------
  async getExperiencias(perfilId: string) {
    const r = await db.query(
      `SELECT id, perfil_id, empresa_nombre, puesto, fecha_inicio, fecha_fin,
              actual, descripcion, actividades, tipo_contrato, tecnologias_usadas
       FROM EXPERIENCIA_LABORAL
       WHERE perfil_id = $1
       ORDER BY actual DESC, fecha_inicio DESC`,
      [perfilId]
    );
    return r.rows;
  }

  async createExperiencia(perfilId: string, d: CreateExperienciaDTO) {
    const r = await db.query(
      `INSERT INTO EXPERIENCIA_LABORAL
         (perfil_id, empresa_nombre, puesto, fecha_inicio, fecha_fin, actual,
          descripcion, actividades, tipo_contrato, tecnologias_usadas)
       VALUES ($1,$2,$3,$4,$5,COALESCE($6,false),$7,$8,$9,$10)
       RETURNING *`,
      [
        perfilId,
        d.empresa_nombre ?? null,
        d.puesto,
        d.fecha_inicio,
        d.actual ? null : d.fecha_fin ?? null,
        d.actual ?? false,
        d.descripcion ?? null,
        d.actividades ? JSON.stringify(d.actividades) : null,
        d.tipo_contrato ?? null,
        d.tecnologias_usadas ?? null,
      ]
    );
    return r.rows[0];
  }

  async updateExperiencia(id: string, perfilId: string, d: UpdateExperienciaDTO) {
    const map: Record<string, any> = {
      empresa_nombre: d.empresa_nombre,
      puesto: d.puesto,
      fecha_inicio: d.fecha_inicio,
      fecha_fin: d.actual ? null : d.fecha_fin,
      actual: d.actual,
      descripcion: d.descripcion,
      actividades: d.actividades !== undefined ? JSON.stringify(d.actividades) : undefined,
      tipo_contrato: d.tipo_contrato,
      tecnologias_usadas: d.tecnologias_usadas,
    };
    return this.updateDinamico('EXPERIENCIA_LABORAL', id, perfilId, map);
  }

  // -------------------------------------------------------------------------
  // EDUCACION
  // -------------------------------------------------------------------------
  async getEducaciones(perfilId: string) {
    const r = await db.query(
      `SELECT id, perfil_id, institucion, carrera_o_grado, nivel_estudios,
              fecha_inicio, fecha_fin, graduado, promedio
       FROM EDUCACION
       WHERE perfil_id = $1
       ORDER BY fecha_inicio DESC`,
      [perfilId]
    );
    return r.rows;
  }

  async createEducacion(perfilId: string, d: CreateEducacionDTO) {
    const r = await db.query(
      `INSERT INTO EDUCACION
         (perfil_id, institucion, carrera_o_grado, nivel_estudios,
          fecha_inicio, fecha_fin, graduado, promedio)
       VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,false),$8)
       RETURNING *`,
      [
        perfilId,
        d.institucion,
        d.carrera_o_grado,
        d.nivel_estudios ?? null,
        d.fecha_inicio,
        d.fecha_fin ?? null,
        d.graduado ?? false,
        d.promedio ?? null,
      ]
    );
    return r.rows[0];
  }

  async updateEducacion(id: string, perfilId: string, d: UpdateEducacionDTO) {
    const map: Record<string, any> = {
      institucion: d.institucion,
      carrera_o_grado: d.carrera_o_grado,
      nivel_estudios: d.nivel_estudios,
      fecha_inicio: d.fecha_inicio,
      fecha_fin: d.fecha_fin,
      graduado: d.graduado,
      promedio: d.promedio,
    };
    return this.updateDinamico('EDUCACION', id, perfilId, map);
  }

  // -------------------------------------------------------------------------
  // PROYECTOS DE PORTAFOLIO
  // -------------------------------------------------------------------------
  async getProyectos(perfilId: string) {
    const r = await db.query(
      `SELECT id, perfil_id, nombre_proyecto, descripcion, url_repositorio,
              url_despliegue, fecha_realizacion, tecnologias, rol_en_proyecto
       FROM PROYECTOS_PORTAFOLIO
       WHERE perfil_id = $1
       ORDER BY fecha_realizacion DESC NULLS LAST`,
      [perfilId]
    );
    return r.rows;
  }

  async createProyecto(perfilId: string, d: CreateProyectoDTO) {
    const r = await db.query(
      `INSERT INTO PROYECTOS_PORTAFOLIO
         (perfil_id, nombre_proyecto, descripcion, url_repositorio,
          url_despliegue, fecha_realizacion, tecnologias, rol_en_proyecto)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        perfilId,
        d.nombre_proyecto,
        d.descripcion ?? null,
        d.url_repositorio ?? null,
        d.url_despliegue ?? null,
        d.fecha_realizacion ?? null,
        d.tecnologias ?? null,
        d.rol_en_proyecto ?? null,
      ]
    );
    return r.rows[0];
  }

  async updateProyecto(id: string, perfilId: string, d: UpdateProyectoDTO) {
    const map: Record<string, any> = {
      nombre_proyecto: d.nombre_proyecto,
      descripcion: d.descripcion,
      url_repositorio: d.url_repositorio,
      url_despliegue: d.url_despliegue,
      fecha_realizacion: d.fecha_realizacion,
      tecnologias: d.tecnologias,
      rol_en_proyecto: d.rol_en_proyecto,
    };
    return this.updateDinamico('PROYECTOS_PORTAFOLIO', id, perfilId, map);
  }

  // -------------------------------------------------------------------------
  // HABILIDADES
  // -------------------------------------------------------------------------
  async getHabilidades(perfilId: string) {
    const r = await db.query(
      `SELECT ph.id, ph.habilidad_id, h.nombre, ph.nivel, ph.anos_experiencia
       FROM PERFIL_HABILIDADES ph
       JOIN HABILIDADES h ON h.id = ph.habilidad_id
       WHERE ph.perfil_id = $1
       ORDER BY h.nombre ASC`,
      [perfilId]
    );
    return r.rows;
  }

  /** Busca la habilidad por nombre (case-insensitive) o la crea en el catalogo. */
  async findOrCreateHabilidad(nombre: string): Promise<string> {
    const existente = await db.query(
      `SELECT id FROM HABILIDADES WHERE LOWER(nombre) = LOWER($1)`,
      [nombre]
    );
    if (existente.rows[0]) return existente.rows[0].id;

    const creada = await db.query(
      `INSERT INTO HABILIDADES (nombre) VALUES ($1) RETURNING id`,
      [nombre]
    );
    return creada.rows[0].id;
  }

  async addHabilidad(perfilId: string, habilidadId: string, nivel?: string, anos?: number) {
    const r = await db.query(
      `INSERT INTO PERFIL_HABILIDADES (perfil_id, habilidad_id, nivel, anos_experiencia)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (perfil_id, habilidad_id)
       DO UPDATE SET nivel = EXCLUDED.nivel, anos_experiencia = EXCLUDED.anos_experiencia
       RETURNING id`,
      [perfilId, habilidadId, nivel ?? null, anos ?? null]
    );
    return r.rows[0].id;
  }

  async deleteHabilidad(id: string, perfilId: string): Promise<boolean> {
    const r = await db.query(
      `DELETE FROM PERFIL_HABILIDADES WHERE id = $1 AND perfil_id = $2`,
      [id, perfilId]
    );
    return (r.rowCount ?? 0) > 0;
  }

  // -------------------------------------------------------------------------
  // Borrado generico (con ownership) para experiencia/educacion/proyectos
  // -------------------------------------------------------------------------
  async deleteItem(tabla: string, id: string, perfilId: string): Promise<boolean> {
    const r = await db.query(
      `DELETE FROM ${tabla} WHERE id = $1 AND perfil_id = $2`,
      [id, perfilId]
    );
    return (r.rowCount ?? 0) > 0;
  }

  // -------------------------------------------------------------------------
  // Helper: UPDATE dinamico con whitelist implicita (solo campos !== undefined)
  // y ownership por perfil_id.
  // -------------------------------------------------------------------------
  private async updateDinamico(
    tabla: string,
    id: string,
    perfilId: string,
    campos: Record<string, any>
  ) {
    const sets: string[] = [];
    const values: any[] = [];
    let i = 1;

    for (const [col, val] of Object.entries(campos)) {
      if (val !== undefined) {
        sets.push(`${col} = $${i++}`);
        values.push(val);
      }
    }

    if (sets.length === 0) {
      const actual = await db.query(
        `SELECT * FROM ${tabla} WHERE id = $1 AND perfil_id = $2`,
        [id, perfilId]
      );
      return actual.rows[0] || null;
    }

    values.push(id, perfilId);
    const r = await db.query(
      `UPDATE ${tabla} SET ${sets.join(', ')}
       WHERE id = $${i++} AND perfil_id = $${i}
       RETURNING *`,
      values
    );
    return r.rows[0] || null;
  }
}

export const profileDAO = new ProfileDAO();
