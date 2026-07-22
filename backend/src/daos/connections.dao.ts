//nota porque no me deja subirlo a git

import { db } from '../config/db';
import { CreateConnectionDTO, ConnectionFilters } from '../modules/connections/connections.types';

export class ConnectionsDAO {
  /**
   * Crear una conexión en la base de datos
   */
  async createConnection(data: CreateConnectionDTO) {
    // Verificar si ya existe la conexión
    const checkQuery = `
      SELECT id FROM CONEXIONES
      WHERE follower_id = $1 AND following_id = $2
    `;
    const checkRes = await db.query(checkQuery, [data.follower_id, data.following_id]);
    
    if (checkRes.rows.length > 0) {
      throw new Error('Ya existe esta conexión');
    }

    const insertQuery = `
      INSERT INTO CONEXIONES (follower_id, following_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await db.query(insertQuery, [data.follower_id, data.following_id]);
    
    return result.rows[0];
  }

  /**
   * Obtener conexiones con filtros y paginación
   */
  async getConnections(filters: ConnectionFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.follower_id) {
      conditions.push(`c.follower_id = $${paramIndex++}`);
      values.push(filters.follower_id);
    }

    if (filters.following_id) {
      conditions.push(`c.following_id = $${paramIndex++}`);
      values.push(filters.following_id);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM CONEXIONES c
      ${whereClause}
    `;
    const countRes = await db.query(countQuery, values);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    // Obtener conexiones con datos de los perfiles
    const query = `
      SELECT 
        c.id,
        c.follower_id,
        c.following_id,
        c.created_at,
        pf.id as follower_perfil_id,
        pf.titular_profesional as follower_nombre,
        pf.url_foto as follower_foto,
        pf2.id as following_perfil_id,
        pf2.titular_profesional as following_nombre,
        pf2.url_foto as following_foto
      FROM CONEXIONES c
      LEFT JOIN PERFILES pf ON c.follower_id = pf.id
      LEFT JOIN PERFILES pf2 ON c.following_id = pf2.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const pageValues = [...values, limit, offset];
    const result = await db.query(query, pageValues);

    const connections = result.rows.map((row: any) => ({
      id: row.id,
      follower_id: row.follower_id,
      following_id: row.following_id,
      created_at: row.created_at,
      follower: {
        id: row.follower_perfil_id,
        titular_profesional: row.follower_nombre || 'Usuario',
        url_foto: row.follower_foto || null,
      },
      following: {
        id: row.following_perfil_id,
        titular_profesional: row.following_nombre || 'Usuario',
        url_foto: row.following_foto || null,
      },
    }));

    return { connections, total };
  }

  /**
   * Eliminar una conexión
   */
  async deleteConnection(id: string) {
    const query = `
      DELETE FROM CONEXIONES
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      throw new Error('Conexión no encontrada');
    }
    
    return result.rows[0];
  }
}

export const connectionsDAO = new ConnectionsDAO();