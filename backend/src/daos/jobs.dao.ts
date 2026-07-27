import { db } from '../config/db';
import { CreateVacanteDTO, UpdateVacanteDTO, VacanteFilters, VacanteWithRelations } from '../modules/jobs/jobs.types';

export class JobsDAO {
  /**
   * Helper para armar objeto de vacante con empresa y habilidades a partir de filas de DB
   */
  private async enrichVacante(vacanteRow: any): Promise<VacanteWithRelations> {
    const empresaRes = await db.query(
      `SELECT id, nombre, logo_url, sitio_web, descripcion, correo_contacto, telefono FROM EMPRESAS WHERE id = $1`,
      [vacanteRow.empresa_id]
    );

    const habilidadesRes = await db.query(
      `SELECT 
         vh.id, 
         vh.nivel_requerido, 
         vh.es_obligatoria,
         h.id as habilidad_id, 
         h.nombre as habilidad_nombre
       FROM VACANTE_HABILIDADES vh
       JOIN HABILIDADES h ON vh.habilidad_id = h.id
       WHERE vh.vacante_id = $1`,
      [vacanteRow.id]
    );

    const empresa = empresaRes.rows[0] || {
      id: vacanteRow.empresa_id,
      nombre: 'Empresa Desconocida',
      logo_url: null,
      sitio_web: null,
      descripcion: null,
      correo_contacto: null,
      telefono: null,
    };

    const vacante_habilidades = habilidadesRes.rows.map((row: any) => ({
      id: row.id,
      nivel_requerido: row.nivel_requerido,
      es_obligatoria: row.es_obligatoria,
      habilidad: {
        id: row.habilidad_id,
        nombre: row.habilidad_nombre,
      },
    }));

    return {
      ...vacanteRow,
      salario_min: vacanteRow.salario_min ? parseFloat(vacanteRow.salario_min) : null,
      salario_max: vacanteRow.salario_max ? parseFloat(vacanteRow.salario_max) : null,
      empresa,
      vacante_habilidades,
    };
  }

  /**
   * Crear una nueva vacante
   */
  async createVacante(data: CreateVacanteDTO): Promise<VacanteWithRelations> {
    const query = `
      INSERT INTO VACANTES (
        titulo, descripcion, requisitos, url_origen, empresa_id,
        salario_min, salario_max, modalidad, tipo_contrato,
        nivel_experiencia, ubicacion, carreras, cuatrimestre, fecha_limite, imagen_url, activa
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, true)
      RETURNING *
    `;

    const values = [
      data.titulo,
      data.descripcion,
      data.requisitos || null,
      data.url_origen || null,
      data.empresa_id,
      data.salario_min ?? null,
      data.salario_max ?? null,
      data.modalidad || null,
      data.tipo_contrato || null,
      data.nivel_experiencia || null,
      data.ubicacion || null,
      data.carreras && data.carreras.length > 0 ? data.carreras : null,
      data.cuatrimestre ?? null,
      data.fecha_limite || null,
      data.imagen_url || null,
    ];

    const result = await db.query(query, values);
    const newVacante = result.rows[0];

    if (data.habilidades_ids && data.habilidades_ids.length > 0) {
      for (const habilidadId of data.habilidades_ids) {
        await db.query(
          `INSERT INTO VACANTE_HABILIDADES (vacante_id, habilidad_id, es_obligatoria)
           VALUES ($1, $2, false)
           ON CONFLICT (vacante_id, habilidad_id) DO NOTHING`,
          [newVacante.id, habilidadId]
        );
      }
    }

    return this.enrichVacante(newVacante);
  }

  /**
   * Obtener vacantes filtradas y paginadas
   */
  async getVacantes(filters: VacanteFilters): Promise<{ vacantes: VacanteWithRelations[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Estado activo
    if (filters.activa !== undefined && filters.activa !== 'all') {
      conditions.push(`v.activa = $${paramIndex++}`);
      values.push(filters.activa);
    } else if (filters.activa === undefined) {
      conditions.push(`v.activa = true`);
    }

    if (filters.modalidad) {
      conditions.push(`v.modalidad = $${paramIndex++}`);
      values.push(filters.modalidad);
    }

    if (filters.tipo_contrato) {
      conditions.push(`v.tipo_contrato = $${paramIndex++}`);
      values.push(filters.tipo_contrato);
    }

    if (filters.nivel_experiencia) {
      conditions.push(`v.nivel_experiencia = $${paramIndex++}`);
      values.push(filters.nivel_experiencia);
    }

    if (filters.ubicacion) {
      conditions.push(`v.ubicacion ILIKE $${paramIndex++}`);
      values.push(`%${filters.ubicacion}%`);
    }

    if (filters.salario_min !== undefined) {
      conditions.push(`(v.salario_max >= $${paramIndex} OR v.salario_min >= $${paramIndex})`);
      paramIndex++;
      values.push(filters.salario_min);
    }

    // Carrera: la vacante la incluye en su lista, o no tiene restriccion de carrera.
    if (filters.carrera) {
      conditions.push(`(v.carreras IS NULL OR $${paramIndex} = ANY(v.carreras))`);
      paramIndex++;
      values.push(filters.carrera);
    }

    // Cuatrimestre: la vacante no exige uno, o pide uno <= al del alumno.
    if (filters.cuatrimestre !== undefined) {
      conditions.push(`(v.cuatrimestre IS NULL OR v.cuatrimestre <= $${paramIndex})`);
      paramIndex++;
      values.push(filters.cuatrimestre);
    }

    if (filters.search) {
      conditions.push(
        `(v.titulo ILIKE $${paramIndex} OR v.descripcion ILIKE $${paramIndex} OR e.nombre ILIKE $${paramIndex})`
      );
      paramIndex++;
      values.push(`%${filters.search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(DISTINCT v.id) as total
      FROM VACANTES v
      LEFT JOIN EMPRESAS e ON v.empresa_id = e.id
      ${whereClause}
    `;

    const countRes = await db.query(countQuery, values);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const query = `
      SELECT DISTINCT v.*
      FROM VACANTES v
      LEFT JOIN EMPRESAS e ON v.empresa_id = e.id
      ${whereClause}
      ORDER BY v.fecha_publicacion DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const pageValues = [...values, limit, offset];
    const result = await db.query(query, pageValues);

    const vacantes = await Promise.all(result.rows.map(row => this.enrichVacante(row)));

    return { vacantes, total };
  }

  /**
   * Obtener las vacantes más recientes
   */
  async getRecentVacantes(limit: number = 10): Promise<VacanteWithRelations[]> {
    const query = `
      SELECT * FROM VACANTES
      WHERE activa = true
      ORDER BY fecha_publicacion DESC
      LIMIT $1
    `;
    const result = await db.query(query, [limit]);
    return Promise.all(result.rows.map(row => this.enrichVacante(row)));
  }

  /**
   * Obtener vacante por ID
   */
  async getVacanteById(id: string): Promise<VacanteWithRelations | null> {
    const query = `SELECT * FROM VACANTES WHERE id = $1`;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.enrichVacante(result.rows[0]);
  }

  /**
   * Actualizar vacante
   */
  async updateVacante(id: string, data: UpdateVacanteDTO): Promise<VacanteWithRelations> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const mapField = (fieldName: string, value: any) => {
      if (value !== undefined) {
        fields.push(`${fieldName} = $${paramIndex++}`);
        values.push(value);
      }
    };

    mapField('titulo', data.titulo);
    mapField('descripcion', data.descripcion);
    mapField('requisitos', data.requisitos);
    mapField('url_origen', data.url_origen);
    mapField('salario_min', data.salario_min);
    mapField('salario_max', data.salario_max);
    mapField('modalidad', data.modalidad);
    mapField('tipo_contrato', data.tipo_contrato);
    mapField('nivel_experiencia', data.nivel_experiencia);
    mapField('ubicacion', data.ubicacion);
    mapField('carreras', data.carreras && data.carreras.length > 0 ? data.carreras : null);
    mapField('cuatrimestre', data.cuatrimestre);
    mapField('fecha_limite', data.fecha_limite);
    mapField('imagen_url', data.imagen_url);
    mapField('activa', data.activa);

    if (fields.length > 0) {
      values.push(id);
      const query = `
        UPDATE VACANTES
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;
      await db.query(query, values);
    }

    if (data.habilidades_ids) {
      await db.query(`DELETE FROM VACANTE_HABILIDADES WHERE vacante_id = $1`, [id]);

      for (const habilidadId of data.habilidades_ids) {
        await db.query(
          `INSERT INTO VACANTE_HABILIDADES (vacante_id, habilidad_id, es_obligatoria)
           VALUES ($1, $2, false)
           ON CONFLICT (vacante_id, habilidad_id) DO NOTHING`,
          [id, habilidadId]
        );
      }
    }

    const updated = await this.getVacanteById(id);
    if (!updated) {
      throw new Error(`Vacante con id ${id} no encontrada`);
    }

    return updated;
  }

  /**
   * Eliminar vacante (soft delete)
   */
  async deleteVacante(id: string): Promise<boolean> {
    const query = `UPDATE VACANTES SET activa = false WHERE id = $1`;
    const result = await db.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Alumnos a los que les encaja una vacante recien publicada.
   *
   * Usa exactamente la misma regla que el filtro de "recomendadas para tu
   * carrera" del tablero de ofertas, para que el aviso por correo coincida con
   * lo que el alumno ve en la plataforma:
   *   - carrera: la vacante no restringe carreras, o incluye la del alumno.
   *   - cuatrimestre: la vacante no exige uno, o pide uno <= al del alumno.
   */
  async findAlumnosQueHacenMatch(
    carreras: string[] | null,
    cuatrimestre: number | null
  ): Promise<{ correo_institucional: string; nombre_completo: string }[]> {
    const query = `
      SELECT correo_institucional, nombre_completo
      FROM USUARIOS
      WHERE rol = 'estudiante'
        AND activo = true
        AND ($1::text[] IS NULL OR carrera = ANY($1::text[]))
        AND ($2::int IS NULL OR cuatrimestre IS NULL OR cuatrimestre >= $2::int)
    `;
    const result = await db.query(query, [
      carreras && carreras.length > 0 ? carreras : null,
      cuatrimestre ?? null,
    ]);
    return result.rows;
  }
}

export const jobsDAO = new JobsDAO();
