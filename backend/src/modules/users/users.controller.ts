import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { UsersService, ValidationError, NotFoundError } from './users.service';
import { UpdateUserProfileDTO } from './users.types';

export class UsersController {
  /**
   * GET /api/users/me
   * Devuelve el perfil del usuario AUTENTICADO (el id sale del token, no del cliente).
   */
  static async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) {
        return res.status(401).json({ success: false, error: 'No autenticado' });
      }

      const user = await UsersService.getProfile(usuarioId);
      return res.json({ success: true, data: user });
    } catch (error: any) {
      return UsersController.manejarError(res, error, 'Error al obtener el perfil');
    }
  }

  /**
   * PUT /api/users/me
   * Actualiza el perfil del usuario AUTENTICADO.
   */
  static async updateMe(req: AuthenticatedRequest, res: Response) {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) {
        return res.status(401).json({ success: false, error: 'No autenticado' });
      }

      const data: UpdateUserProfileDTO = req.body ?? {};
      const user = await UsersService.updateProfile(usuarioId, data);

      return res.json({ success: true, message: 'Perfil actualizado', data: user });
    } catch (error: any) {
      return UsersController.manejarError(res, error, 'Error al actualizar el perfil');
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
