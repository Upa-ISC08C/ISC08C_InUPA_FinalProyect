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
}
