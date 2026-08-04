import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { UsersService } from './users.service';
import { UpdateUserProfileDTO } from './users.types';
import { UnauthorizedError } from '../../shared/errors';

/**
 * Los metodos no llevan try/catch: se registran con `asyncHandler`, que envia
 * cualquier error al middleware `errorHandler` (ver middlewares/error.middleware.ts).
 */
export class UsersController {
  /**
   * GET /api/users/me
   * Devuelve el perfil del usuario AUTENTICADO (el id sale del token, no del cliente).
   */
  static async getMe(req: AuthenticatedRequest, res: Response) {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      throw new UnauthorizedError();
    }

    const user = await UsersService.getProfile(usuarioId);
    return res.json({ success: true, data: user });
  }

  /**
   * PUT /api/users/me
   * Actualiza el perfil del usuario AUTENTICADO.
   */
  static async updateMe(req: AuthenticatedRequest, res: Response) {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      throw new UnauthorizedError();
    }

    const data: UpdateUserProfileDTO = req.body ?? {};
    const user = await UsersService.updateProfile(usuarioId, data);

    return res.json({ success: true, message: 'Perfil actualizado', data: user });
  }

  /**
   * GET /api/user/stats
   * Metricas del dashboard del estudiante AUTENTICADO.
   */
  static async getStats(req: AuthenticatedRequest, res: Response) {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      throw new UnauthorizedError();
    }

    const stats = await UsersService.getStats(usuarioId);
    return res.json({ success: true, data: stats });
  }

  // ===========================================================================
  // ADMINISTRACION (protegido con requireAdmin en las rutas)
  // ===========================================================================

  /** GET /api/users — lista todos los usuarios. */
  static async list(_req: AuthenticatedRequest, res: Response) {
    const users = await UsersService.listAll();
    return res.json({ success: true, data: users });
  }

  /** GET /api/users/dashboard/admin — estadisticas del panel de administracion. */
  static async dashboardStats(_req: AuthenticatedRequest, res: Response) {
    const data = await UsersService.adminDashboard();
    return res.json({ success: true, data });
  }

  /** GET /api/users/:id — perfil completo de un usuario (solo admin). */
  static async adminGetUser(req: AuthenticatedRequest, res: Response) {
    const user = await UsersService.adminGetUser(req.params.id);
    return res.json({ success: true, data: user });
  }

  /** PUT /api/users/:id — actualiza activo/rol/nombre/etc de un usuario. */
  static async adminUpdate(req: AuthenticatedRequest, res: Response) {
    const user = await UsersService.adminUpdate(req.params.id, req.body ?? {}, req.user?.email);
    return res.json({ success: true, data: user });
  }

  /** POST /api/users — crea un nuevo usuario (admin o estudiante). */
  static async adminCreate(req: AuthenticatedRequest, res: Response) {
    const user = await UsersService.adminCreate(req.body ?? {}, req.user?.email);
    return res.json({ success: true, data: user });
  }

  /** POST /api/users/:id/reset-password — envía un código de restablecimiento al correo del usuario. */
  static async adminResetPassword(req: AuthenticatedRequest, res: Response) {
    const { correo, enviado } = await UsersService.adminResetPassword(req.params.id);
    return res.json({
      success: true,
      correoEnviado: enviado,
      message: enviado
        ? `Se envió un código de restablecimiento a ${correo}`
        : `Se generó el código para ${correo}, pero el correo no pudo salir. Revisa la configuración de envío.`,
    });
  }

  /** DELETE /api/users/:id — desactiva un usuario (borrado suave). */
  static async remove(req: AuthenticatedRequest, res: Response) {
    await UsersService.adminRemove(req.params.id);
    return res.json({ success: true, message: 'Usuario desactivado' });
  }
}
