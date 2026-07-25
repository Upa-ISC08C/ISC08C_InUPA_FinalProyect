import { db } from '../config/db';
import { Company, CreateCompanyDTO, UpdateCompanyDTO } from '../modules/companies/companies.types';

// Columnas que el cliente puede escribir (nunca id ni created_at).
const CAMPOS_EDITABLES: (keyof CreateCompanyDTO)[] = [
  'nombre',
  'industria',
  'descripcion',
  'sitio_web',
  'logo_url',
  'correo_contacto',
  'telefono',
  'ciudad',
  'direccion',
  'tamano',
  'activa',
];

export class CompaniesDAO {
  /** Lista todas las empresas, mas recientes primero. */
  async getAll(): Promise<Company[]> {
    const result = await db.query(
      `SELECT id, nombre, industria, descripcion, sitio_web, logo_url,
              correo_contacto, telefono, ciudad, direccion, tamano, activa, created_at
       FROM EMPRESAS
       ORDER BY created_at DESC`
    );
    return result.rows;
  }

  /** Obtiene una empresa por id. */
  async getById(id: string): Promise<Company | null> {
    const result = await db.query(
      `SELECT id, nombre, industria, descripcion, sitio_web, logo_url,
              correo_contacto, telefono, ciudad, direccion, tamano, activa, created_at
       FROM EMPRESAS
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /** Crea una empresa. */
  async create(data: CreateCompanyDTO): Promise<Company> {
    const result = await db.query(
      `INSERT INTO EMPRESAS
        (nombre, industria, descripcion, sitio_web, logo_url,
         correo_contacto, telefono, ciudad, direccion, tamano, activa)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, TRUE))
       RETURNING id, nombre, industria, descripcion, sitio_web, logo_url,
                 correo_contacto, telefono, ciudad, direccion, tamano, activa, created_at`,
      [
        data.nombre,
        data.industria ?? null,
        data.descripcion ?? null,
        data.sitio_web ?? null,
        data.logo_url ?? null,
        data.correo_contacto ?? null,
        data.telefono ?? null,
        data.ciudad ?? null,
        data.direccion ?? null,
        data.tamano ?? null,
        data.activa ?? null,
      ]
    );
    return result.rows[0];
  }

  /** Actualiza dinamicamente solo los campos enviados (whitelist). */
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

    if (sets.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    const result = await db.query(
      `UPDATE EMPRESAS SET ${sets.join(', ')}
       WHERE id = $${i}
       RETURNING id, nombre, industria, descripcion, sitio_web, logo_url,
                 correo_contacto, telefono, ciudad, direccion, tamano, activa, created_at`,
      values
    );
    return result.rows[0] || null;
  }

  /** Borrado suave: marca la empresa como inactiva. */
  async softDelete(id: string): Promise<boolean> {
    const result = await db.query(
      `UPDATE EMPRESAS SET activa = FALSE WHERE id = $1`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }
}

export const companiesDAO = new CompaniesDAO();
