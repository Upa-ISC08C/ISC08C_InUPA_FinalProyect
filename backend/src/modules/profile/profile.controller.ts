import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { ProfileService } from './profile.service';
import { UnauthorizedError } from '../../shared/errors';

/**
 * Perfil profesional del usuario autenticado (estilo LinkedIn).
 * Los metodos van con asyncHandler: los errores llegan al errorHandler.
 */
export class ProfileController {
  private static uid(req: AuthenticatedRequest): string {
    const id = req.user?.id;
    if (!id) throw new UnauthorizedError();
    return id;
  }

  static async getMe(req: AuthenticatedRequest, res: Response) {
    const data = await ProfileService.getMyProfile(ProfileController.uid(req));
    return res.json({ success: true, data });
  }

  // EXPERIENCIA
  static async addExperiencia(req: AuthenticatedRequest, res: Response) {
    const item = await ProfileService.addExperiencia(ProfileController.uid(req), req.body ?? {});
    return res.status(201).json({ success: true, data: item });
  }
  static async updateExperiencia(req: AuthenticatedRequest, res: Response) {
    const item = await ProfileService.updateExperiencia(ProfileController.uid(req), req.params.id, req.body ?? {});
    return res.json({ success: true, data: item });
  }
  static async deleteExperiencia(req: AuthenticatedRequest, res: Response) {
    await ProfileService.deleteExperiencia(ProfileController.uid(req), req.params.id);
    return res.json({ success: true });
  }

  // EDUCACION
  static async addEducacion(req: AuthenticatedRequest, res: Response) {
    const item = await ProfileService.addEducacion(ProfileController.uid(req), req.body ?? {});
    return res.status(201).json({ success: true, data: item });
  }
  static async updateEducacion(req: AuthenticatedRequest, res: Response) {
    const item = await ProfileService.updateEducacion(ProfileController.uid(req), req.params.id, req.body ?? {});
    return res.json({ success: true, data: item });
  }
  static async deleteEducacion(req: AuthenticatedRequest, res: Response) {
    await ProfileService.deleteEducacion(ProfileController.uid(req), req.params.id);
    return res.json({ success: true });
  }

  // PROYECTOS
  static async addProyecto(req: AuthenticatedRequest, res: Response) {
    const item = await ProfileService.addProyecto(ProfileController.uid(req), req.body ?? {});
    return res.status(201).json({ success: true, data: item });
  }
  static async updateProyecto(req: AuthenticatedRequest, res: Response) {
    const item = await ProfileService.updateProyecto(ProfileController.uid(req), req.params.id, req.body ?? {});
    return res.json({ success: true, data: item });
  }
  static async deleteProyecto(req: AuthenticatedRequest, res: Response) {
    await ProfileService.deleteProyecto(ProfileController.uid(req), req.params.id);
    return res.json({ success: true });
  }

  // HABILIDADES
  static async addHabilidad(req: AuthenticatedRequest, res: Response) {
    const lista = await ProfileService.addHabilidad(ProfileController.uid(req), req.body ?? {});
    return res.status(201).json({ success: true, data: lista });
  }
  static async deleteHabilidad(req: AuthenticatedRequest, res: Response) {
    await ProfileService.deleteHabilidad(ProfileController.uid(req), req.params.id);
    return res.json({ success: true });
  }
}
