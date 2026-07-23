import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { NotificationsService } from './notifications.service';
import { UnauthorizedError } from '../../shared/errors';

/**
 * Los metodos no llevan try/catch: se registran con `asyncHandler`, que envia
 * cualquier error al middleware `errorHandler`.
 */
export class NotificationsController {
  /**
   * GET /api/notifications?soloNoLeidas=true&page=1&limit=10
   * Lista las notificaciones del usuario AUTENTICADO.
   */
  static async listar(req: AuthenticatedRequest, res: Response) {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      throw new UnauthorizedError();
    }

    const resultado = await NotificationsService.listar(usuarioId, {
      soloNoLeidas: req.query.soloNoLeidas === 'true',
      page: typeof req.query.page === 'string' ? parseInt(req.query.page, 10) : 1,
      limit: typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 10,
    });

    return res.json({ success: true, ...resultado });
  }

  /**
   * GET /api/notifications/unread-count
   * Contador para el badge de la campana.
   */
  static async contarNoLeidas(req: AuthenticatedRequest, res: Response) {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      throw new UnauthorizedError();
    }

    const noLeidas = await NotificationsService.contarNoLeidas(usuarioId);
    return res.json({ success: true, noLeidas });
  }

  /**
   * PATCH /api/notifications/:id/read
   * Marca UNA notificacion del usuario autenticado como leida.
   */
  static async marcarLeida(req: AuthenticatedRequest, res: Response) {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      throw new UnauthorizedError();
    }

    const notificacion = await NotificationsService.marcarLeida(req.params.id, usuarioId);
    return res.json({ success: true, data: notificacion });
  }

  /**
   * PATCH /api/notifications/read-all
   * Marca todas las del usuario autenticado como leidas.
   */
  static async marcarTodasLeidas(req: AuthenticatedRequest, res: Response) {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      throw new UnauthorizedError();
    }

    const actualizadas = await NotificationsService.marcarTodasLeidas(usuarioId);
    return res.json({
      success: true,
      message: `${actualizadas} notificaciones marcadas como leidas`,
      actualizadas,
    });
  }
}
