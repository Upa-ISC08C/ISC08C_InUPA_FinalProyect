import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { NotificationsService, ValidationError, NotFoundError } from './notifications.service';

export class NotificationsController {
  /**
   * GET /api/notifications?soloNoLeidas=true&page=1&limit=10
   * Lista las notificaciones del usuario AUTENTICADO.
   */
  static async listar(req: AuthenticatedRequest, res: Response) {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) {
        return res.status(401).json({ success: false, error: 'No autenticado' });
      }

      const resultado = await NotificationsService.listar(usuarioId, {
        soloNoLeidas: req.query.soloNoLeidas === 'true',
        page: typeof req.query.page === 'string' ? parseInt(req.query.page, 10) : 1,
        limit: typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 10,
      });

      return res.json({ success: true, ...resultado });
    } catch (error: any) {
      return NotificationsController.manejarError(res, error, 'Error al obtener las notificaciones');
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Contador para el badge de la campana.
   */
  static async contarNoLeidas(req: AuthenticatedRequest, res: Response) {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) {
        return res.status(401).json({ success: false, error: 'No autenticado' });
      }

      const noLeidas = await NotificationsService.contarNoLeidas(usuarioId);
      return res.json({ success: true, noLeidas });
    } catch (error: any) {
      return NotificationsController.manejarError(res, error, 'Error al contar notificaciones');
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Marca UNA notificacion del usuario autenticado como leida.
   */
  static async marcarLeida(req: AuthenticatedRequest, res: Response) {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) {
        return res.status(401).json({ success: false, error: 'No autenticado' });
      }

      const notificacion = await NotificationsService.marcarLeida(req.params.id, usuarioId);
      return res.json({ success: true, data: notificacion });
    } catch (error: any) {
      return NotificationsController.manejarError(res, error, 'Error al marcar la notificacion');
    }
  }

  /**
   * PATCH /api/notifications/read-all
   * Marca todas las del usuario autenticado como leidas.
   */
  static async marcarTodasLeidas(req: AuthenticatedRequest, res: Response) {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) {
        return res.status(401).json({ success: false, error: 'No autenticado' });
      }

      const actualizadas = await NotificationsService.marcarTodasLeidas(usuarioId);
      return res.json({ success: true, message: `${actualizadas} notificaciones marcadas como leidas`, actualizadas });
    } catch (error: any) {
      return NotificationsController.manejarError(res, error, 'Error al marcar las notificaciones');
    }
  }

  private static manejarError(res: Response, error: any, mensajeGenerico: string) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ success: false, error: error.message });
    }
    if (error instanceof NotFoundError) {
      return res.status(404).json({ success: false, error: error.message });
    }
    console.error(mensajeGenerico, error);
    return res.status(500).json({ success: false, error: mensajeGenerico });
  }
}
