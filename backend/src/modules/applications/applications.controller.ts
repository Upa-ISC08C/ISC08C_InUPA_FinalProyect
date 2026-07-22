import { Request, Response } from 'express';
import { ApplicationsService } from './applications.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class ApplicationsController {
  static async getMyApplications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'No autorizado',
        });
      }

      const applications = await ApplicationsService.getMyApplications(userId);

      res.json({
        success: true,
        data: applications,
      });
    } catch (error) {
      console.error('Error al obtener aplicaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener aplicaciones',
      });
    }
  }

  static async createApplication(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { vacante_id } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'No autorizado',
        });
      }

      if (!vacante_id) {
        return res.status(400).json({
          success: false,
          error: 'ID de vacante requerido',
        });
      }

      const application = await ApplicationsService.createApplication(userId, vacante_id);

      res.status(201).json({
        success: true,
        message: 'Postulación creada exitosamente',
        data: application,
      });
    } catch (error: any) {
      console.error('Error al crear aplicación:', error);
      
      if (error.message.includes('ya te has postulado')) {
        return res.status(409).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error al crear postulación',
      });
    }
  }

  static async getApplicationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const application = await ApplicationsService.getApplicationById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Postulación no encontrada',
        });
      }

      res.json({
        success: true,
        data: application,
      });
    } catch (error) {
      console.error('Error al obtener aplicación:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener aplicación',
      });
    }
  }
}
