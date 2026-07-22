import { db } from '../config/db';

export class ApplicationsDAO {
  /**
   * Obtener o crear el perfil de un usuario por su usuario_id
   */
  async getPerfilByUserId(userId: string): Promise<any | null> {
    const query = `SELECT * FROM PERFILES WHERE usuario_id = $1`;
    const res = await db.query(query, [userId]);
    if (res.rows.length > 0) {
      return res.rows[0];
    }
    // Si el usuario aún no tiene perfil, se crea un perfil básico implícito
    const createQuery = `
      INSERT INTO PERFILES (usuario_id)
      VALUES ($1)
      RETURNING *
    `;
    const newRes = await db.query(createQuery, [userId]);
    return newRes.rows[0];
  }

  /**
   * Obtener todas las aplicaciones de un usuario
   */
  async getMyApplications(userId: string) {
    const perfil = await this.getPerfilByUserId(userId);
    if (!perfil) {
      throw new Error('Perfil no encontrado');
    }

    const query = `
      SELECT 
        p.id,
        p.perfil_id,
        p.vacante_id,
        p.cv_adaptado_id,
        p.fecha_postulacion,
        p.estado,
        v.titulo as vacante_titulo,
        v.descripcion as vacante_descripcion,
        v.ubicacion as vacante_ubicacion,
        v.modalidad as vacante_modalidad,
        v.tipo_contrato as vacante_tipo_contrato,
        v.salario_min as vacante_salario_min,
        v.salario_max as vacante_salario_max,
        e.id as empresa_id,
        e.nombre as empresa_nombre,
        e.logo_url as empresa_logo_url
      FROM POSTULACIONES p
      JOIN VACANTES v ON p.vacante_id = v.id
      LEFT JOIN EMPRESAS e ON v.empresa_id = e.id
      WHERE p.perfil_id = $1
      ORDER BY p.fecha_postulacion DESC
    `;

    const result = await db.query(query, [perfil.id]);

    return result.rows.map((row: any) => ({
      id: row.id,
      perfil_id: row.perfil_id,
      vacante_id: row.vacante_id,
      cv_adaptado_id: row.cv_adaptado_id,
      fecha_postulacion: row.fecha_postulacion,
      estado: row.estado,
      vacante: {
        id: row.vacante_id,
        titulo: row.vacante_titulo,
        descripcion: row.vacante_descripcion,
        ubicacion: row.vacante_ubicacion,
        modalidad: row.vacante_modalidad,
        tipo_contrato: row.vacante_tipo_contrato,
        salario_min: row.vacante_salario_min ? parseFloat(row.vacante_salario_min) : null,
        salario_max: row.vacante_salario_max ? parseFloat(row.vacante_salario_max) : null,
        empresa: {
          id: row.empresa_id,
          nombre: row.empresa_nombre || 'Empresa',
          logo_url: row.empresa_logo_url || null,
        },
      },
    }));
  }

  /**
   * Crear una nueva postulación
   */
  async createApplication(userId: string, vacanteId: string) {
    const perfil = await this.getPerfilByUserId(userId);
    if (!perfil) {
      throw new Error('Perfil no encontrado');
    }

    const checkQuery = `
      SELECT id FROM POSTULACIONES
      WHERE perfil_id = $1 AND vacante_id = $2
    `;
    const checkRes = await db.query(checkQuery, [perfil.id, vacanteId]);
    if (checkRes.rows.length > 0) {
      throw new Error('Ya te has postulado a esta vacante');
    }

    const insertQuery = `
      INSERT INTO POSTULACIONES (perfil_id, vacante_id, estado)
      VALUES ($1, $2, 'pendiente')
      RETURNING *
    `;
    const insertRes = await db.query(insertQuery, [perfil.id, vacanteId]);
    const newPostulacion = insertRes.rows[0];

    return this.getApplicationById(newPostulacion.id);
  }

  /**
   * Obtener una postulación específica por ID
   */
  async getApplicationById(id: string) {
    const query = `
      SELECT 
        p.id,
        p.perfil_id,
        p.vacante_id,
        p.cv_adaptado_id,
        p.fecha_postulacion,
        p.estado,
        v.titulo as vacante_titulo,
        v.descripcion as vacante_descripcion,
        v.ubicacion as vacante_ubicacion,
        v.modalidad as vacante_modalidad,
        v.tipo_contrato as vacante_tipo_contrato,
        v.salario_min as vacante_salario_min,
        v.salario_max as vacante_salario_max,
        e.id as empresa_id,
        e.nombre as empresa_nombre,
        e.logo_url as empresa_logo_url
      FROM POSTULACIONES p
      JOIN VACANTES v ON p.vacante_id = v.id
      LEFT JOIN EMPRESAS e ON v.empresa_id = e.id
      WHERE p.id = $1
    `;
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      perfil_id: row.perfil_id,
      vacante_id: row.vacante_id,
      cv_adaptado_id: row.cv_adaptado_id,
      fecha_postulacion: row.fecha_postulacion,
      estado: row.estado,
      vacante: {
        id: row.vacante_id,
        titulo: row.vacante_titulo,
        descripcion: row.vacante_descripcion,
        ubicacion: row.vacante_ubicacion,
        modalidad: row.vacante_modalidad,
        tipo_contrato: row.vacante_tipo_contrato,
        salario_min: row.vacante_salario_min ? parseFloat(row.vacante_salario_min) : null,
        salario_max: row.vacante_salario_max ? parseFloat(row.vacante_salario_max) : null,
        empresa: {
          id: row.empresa_id,
          nombre: row.empresa_nombre || 'Empresa',
          logo_url: row.empresa_logo_url || null,
        },
      },
    };
  }
}

export const applicationsDAO = new ApplicationsDAO();
