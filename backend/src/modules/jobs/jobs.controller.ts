import { Request, Response } from 'express';
import { JobsService } from './jobs.service';
import { CreateVacanteDTO, UpdateVacanteDTO, VacanteFilters } from './jobs.types';

export class JobsController {
  static async createVacante(req: Request, res: Response) {
    const data: CreateVacanteDTO = req.body;
    const vacante = await JobsService.createVacante(data);
    
    res.status(201).json({
      success: true,
      message: 'Vacante creada exitosamente',
      data: vacante,
    });
  }

  static async contactCompany(req: any, res: Response) {
    const userId = req.user?.id;
    const { id } = req.params;
    const { mensaje } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    await JobsService.contactCompany(userId, id, mensaje);
    
    res.json({
      success: true,
      message: 'Correo enviado a la empresa exitosamente',
    });
  }

  static async getVacantes(req: Request, res: Response) {
    const filters: VacanteFilters = req.query as unknown as VacanteFilters;

    const { vacantes, total } = await JobsService.getVacantes(filters);

    res.json({
      success: true,
      data: vacantes,
      pagination: {
        total,
        page: filters.page || 1,
        limit: filters.limit || 10,
        totalPages: Math.ceil(total / (filters.limit || 10)),
      },
    });
  }

  static async getRecentVacantes(req: Request, res: Response) {
    const limitParam = req.query.limit;
    const limit = typeof limitParam === 'string' ? parseInt(limitParam) : 10;
    
    const vacantes = await JobsService.getRecentVacantes(limit);

    res.json({
      success: true,
      data: vacantes,
    });
  }

  static async getVacanteById(req: Request, res: Response) {
    const { id } = req.params;
    const vacante = await JobsService.getVacanteById(id);

    if (!vacante) {
      return res.status(404).json({
        success: false,
        error: 'Vacante no encontrada',
      });
    }

    res.json({
      success: true,
      data: vacante,
    });
  }

  static async updateVacante(req: Request, res: Response) {
    const { id } = req.params;
    const data: UpdateVacanteDTO = req.body;

    const vacante = await JobsService.updateVacante(id, data);

    res.json({
      success: true,
      message: 'Vacante actualizada exitosamente',
      data: vacante,
    });
  }

  static async deleteVacante(req: Request, res: Response) {
    const { id } = req.params;
    
    await JobsService.deleteVacante(id);

    res.json({
      success: true,
      message: 'Vacante eliminada exitosamente',
    });
  }
}