import { db } from '../config/db';
import { Company, CreateCompanyDTO, UpdateCompanyDTO } from '../modules/companies/companies.types';

const CAMPOS_EDITABLES: (keyof CreateCompanyDTO)[] = [
  'nombre', 'industria', 'descripcion', 'sitio_web', 'logo_url',
  'correo_contacto', 'telefono', 'ciudad', 'direccion', 'tamano', 'activa',
];

export class CompaniesDAO {
  async getAll(): Promise<Company[]> {
    const result = await db.query(
      `SELECT id, nombre, industria, descripcion, sitio_web, logo_url,
              correo_contacto, telefono, ciudad, direccion, tamano, activa, created_at
       FROM EMPRESAS ORDER BY created_at DESC`
    );
    return result.rows;
  }

  async getById(id: string): Promise<Company | null> {
    const result = await db.query(
      `SELECT id, nombre, industria, descripcion, sitio_web, logo_url,
              correo_contacto, telefono, ciudad, direccion, tamano, activa, created_at
       FROM EMPRESAS WHERE id = $1`, [id]
    );
    return result.rows[0] || null;
  }

  async existsByName(nombre: string, excludeId?: string) {
    let query = 'SELECT id FROM EMPRESAS WHERE LOWER(nombre) = LOWER($1)';
    let params: any[] = [nombre.trim()];
    if (excludeId) {
      query += ' AND id != $2';
      params.push(excludeId);
    }
    const result = await db.query(query, params);
    return result.rows.length > 0;
  }

  async create(data: CreateCompanyDTO): Promise<Company> {
    const result = await db.query(
      `INSERT INTO EMPRESAS
        (nombre, industria, descripcion, sitio_web, logo_url,
         correo_contacto, telefono, ciudad, direccion, tamano, activa)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, TRUE))
       RETURNING id, nombre, industria, descripcion, sitio_web, logo_url,
                 correo_contacto, telefono, ciudad, direccion, tamano, activa, created_at`,
      [
        data.nombre, data.industria ?? null, data.descripcion ?? null, data.sitio_web ?? null,
        data.logo_url ?? null, data.correo_contacto ?? null, data.telefono ?? null,
        data.ciudad ?? null, data.direccion ?? null, data.tamano ?? null, data.activa ?? null,
      ]
    );
    return result.rows[0];
  }

  async update(id: string, data: UpdateCompanyDTO): Promise<Company | null> {
    const sets: string[] = [];
    const values: any[] = [];
    let i = 1;

    for (const campo of CAMPOS_EDITABLES) {
      const valor = (data as Record<string, unknown>)[campo];
      if (valor !== undefined) {
        sets.push(`${campo} = $${i++}`);
        values.push(valor);
      }
    }

    if (sets.length === 0) return this.getById(id);

    values.push(id);
    const result = await db.query(
      `UPDATE EMPRESAS SET ${sets.join(', ')} WHERE id = $${i}
       RETURNING id, nombre, industria, descripcion, sitio_web, logo_url,
                 correo_contacto, telefono, ciudad, direccion, tamano, activa, created_at`,
      values
    );
    return result.rows[0] || null;
  }

  /** Borrado suave: marca la empresa como inactiva. */
  async softDelete(id: string): Promise<boolean> {
    const result = await db.query('UPDATE EMPRESAS SET activa = FALSE WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  /** Borrado real (Hard Delete) con validación de vacantes. */
  async hardDelete(id: string): Promise<boolean> {
    // 1. Verificar si tiene vacantes asociadas
    const vacantes = await db.query('SELECT id FROM VACANTES WHERE empresa_id = $1', [id]);
    if (vacantes.rows.length > 0) {
      throw new Error('No se puede eliminar la empresa porque tiene vacantes asociadas. Desactívala en su lugar.');
    }
    
    // 2. Eliminación real
    const result = await db.query('DELETE FROM EMPRESAS WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export const companiesDAO = new CompaniesDAO();