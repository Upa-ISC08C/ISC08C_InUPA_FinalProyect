import { db } from '../config/db';
import {
  Notificacion,
  CreateNotificacionDTO,
  NotificacionFilters,
  NotificacionesPage,
} from '../modules/notifications/notifications.types';

export class NotificationsDAO {
  async create(data: CreateNotificacionDTO): Promise<Notificacion> {
    const query = `
      INSERT INTO NOTIFICACIONES (usuario_id, tipo, titulo, mensaje, enlace)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await db.query(query, [
      data.usuario_id,
      data.tipo,
      data.titulo,
      data.mensaje,
      data.enlace ?? null,
    ]);
    return result.rows[0];
  }

  /**
   * Lista paginada de las notificaciones de UN usuario.
   * El usuario_id siempre lo impone el servicio a partir del token.
   */
  async findByUsuario(usuarioId: string, filters: NotificacionFilters): Promise<NotificacionesPage> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? Math.min(filters.limit, 50) : 10;
    const offset = (page - 1) * limit;

    const condiciones = ['usuario_id = $1'];
    const values: any[] = [usuarioId];

    if (filters.soloNoLeidas) {
      condiciones.push('leida = false');
    }

    const where = `WHERE ${condiciones.join(' AND ')}`;

    const totalRes = await db.query(`SELECT COUNT(*) FROM NOTIFICACIONES ${where}`, values);
    const noLeidasRes = await db.query(
      `SELECT COUNT(*) FROM NOTIFICACIONES WHERE usuario_id = $1 AND leida = false`,
      [usuarioId]
    );

    const result = await db.query(
      `SELECT * FROM NOTIFICACIONES ${where}
       ORDER BY created_at DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, offset]
    );

    return {
      notificaciones: result.rows,
      total: parseInt(totalRes.rows[0].count, 10),
      noLeidas: parseInt(noLeidasRes.rows[0].count, 10),
      page,
      limit,
    };
  }

  async findById(id: string): Promise<Notificacion | null> {
    const result = await db.query(`SELECT * FROM NOTIFICACIONES WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  /**
   * Marca como leida SOLO si la notificacion pertenece al usuario.
   * La condicion del usuario va en el propio UPDATE para evitar
   * que alguien marque notificaciones ajenas.
   */
  async marcarLeida(id: string, usuarioId: string): Promise<Notificacion | null> {
    const result = await db.query(
      `UPDATE NOTIFICACIONES SET leida = true
       WHERE id = $1 AND usuario_id = $2
       RETURNING *`,
      [id, usuarioId]
    );
    return result.rows[0] || null;
  }

  /** Marca todas las del usuario como leidas. Devuelve cuantas cambiaron. */
  async marcarTodasLeidas(usuarioId: string): Promise<number> {
    const result = await db.query(
      `UPDATE NOTIFICACIONES SET leida = true
       WHERE usuario_id = $1 AND leida = false`,
      [usuarioId]
    );
    return result.rowCount ?? 0;
  }

  async contarNoLeidas(usuarioId: string): Promise<number> {
    const result = await db.query(
      `SELECT COUNT(*) FROM NOTIFICACIONES WHERE usuario_id = $1 AND leida = false`,
      [usuarioId]
    );
    return parseInt(result.rows[0].count, 10);
  }
}

export const notificationsDAO = new NotificationsDAO();
