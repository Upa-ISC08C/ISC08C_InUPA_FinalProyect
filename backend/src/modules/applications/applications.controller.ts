import { Request, Response } from 'express';
import { ApplicationsService } from './applications.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { UnauthorizedError, NotFoundError } from '../../shared/errors';

export class ApplicationsController {
  static async getMyApplications(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError();

    const applications = await ApplicationsService.getMyApplications(userId);

    res.json({
      success: true,
      data: applications,
    });
  }

  static async createApplication(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError();

    const { vacante_id } = req.body;
    const application = await ApplicationsService.createApplication(userId, vacante_id);

    res.status(201).json({
      success: true,
      message: 'Postulación creada exitosamente',
      data: application,
    });
  }

  static async deleteApplication(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError();

    const { id } = req.params;
    await ApplicationsService.deleteApplication(userId, id);

    res.json({
      success: true,
      message: 'Postulación eliminada',
    });
  }

  static async getApplicationById(req: Request, res: Response) {
    const { id } = req.params;
    const application = await ApplicationsService.getApplicationById(id);

    if (!application) {
      throw new NotFoundError('Postulación no encontrada');
    }

    res.json({
      success: true,
      data: application,
    });
  }
}
