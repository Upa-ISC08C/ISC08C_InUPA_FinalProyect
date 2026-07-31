import { db } from '../config/db';

export class CarrerasDAO {
  async getAll() {
    const result = await db.query('SELECT * FROM CARRERAS ORDER BY nombre');
    return result.rows;
  }

  async getById(id: string) {
    const result = await db.query('SELECT * FROM CARRERAS WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(nombre: string) {
    const result = await db.query(
      'INSERT INTO CARRERAS (nombre) VALUES ($1) RETURNING *',
      [nombre.trim()]
    );
    return result.rows[0];
  }

  async update(id: string, nombre: string) {
    const result = await db.query(
      'UPDATE CARRERAS SET nombre = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [nombre.trim(), id]
    );
    return result.rows[0] || null;
  }

  async delete(id: string) {
    const result = await db.query('DELETE FROM CARRERAS WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }

  async existsByName(nombre: string, excludeId?: string) {
    let query = 'SELECT id FROM CARRERAS WHERE LOWER(nombre) = LOWER($1)';
    let params: any[] = [nombre.trim()];
    if (excludeId) {
      query += ' AND id != $2';
      params.push(excludeId);
    }
    const result = await db.query(query, params);
    return result.rows.length > 0;
  }
}

export const carrerasDAO = new CarrerasDAO();