import { Request, Response } from 'express';
import { JobsService } from './jobs.service';
import { CreateVacanteDTO, UpdateVacanteDTO, VacanteFilters } from './jobs.types';

export class JobsController {
  static async createVacante(req: Request, res: Response) {
    try {
      const data: CreateVacanteDTO = req.body;

      if (!data.titulo || !data.descripcion || !data.empresa_id) {
        return res.status(400).json({
          success: false,
          error: 'Los campos titulo, descripcion y empresa_id son obligatorios',
        });
      }

      const vacante = await JobsService.createVacante(data);
      
      res.status(201).json({
        success: true,
        message: 'Vacante creada exitosamente',
        data: vacante,
      });
    } catch (error) {
      console.error('Error al crear vacante:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  }

  static async getVacantes(req: Request, res: Response) {
    try {
      const filters: VacanteFilters = {
        activa: req.query.activa === 'true' ? true : req.query.activa === 'false' ? false : undefined,
        modalidad: typeof req.query.modalidad === 'string' ? req.query.modalidad : undefined,
        tipo_contrato: typeof req.query.tipo_contrato === 'string' ? req.query.tipo_contrato : undefined,
        nivel_experiencia: typeof req.query.nivel_experiencia === 'string' ? req.query.nivel_experiencia : undefined,
        ubicacion: typeof req.query.ubicacion === 'string' ? req.query.ubicacion : undefined,
        salario_min: typeof req.query.salario_min === 'string' ? parseFloat(req.query.salario_min) : undefined,
        search: typeof req.query.search === 'string' ? req.query.search : undefined,
        page: typeof req.query.page === 'string' ? parseInt(req.query.page) : 1,
        limit: typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 10,
      };

      const { vacantes, total } = await JobsService.getVacantes(filters);

      res.json({
        success: true,
        data: vacantes,
        pagination: {
          total,
          page: filters.page,
          limit: filters.limit,
          totalPages: Math.ceil(total / (filters.limit || 10)),
        },
      });
    } catch (error) {
      console.error('Error al obtener vacantes:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  }

  static async getRecentVacantes(req: Request, res: Response) {
    try {
      const limitParam = req.query.limit;
      const limit = typeof limitParam === 'string' ? parseInt(limitParam) : 10;
      
      const vacantes = await JobsService.getRecentVacantes(limit);

      res.json({
        success: true,
        data: vacantes,
      });
    } catch (error) {
      console.error('Error al obtener vacantes recientes:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  }

  static async getVacanteById(req: Request, res: Response) {
    try {
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
    } catch (error) {
      console.error('Error al obtener la vacante:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  }

  static async updateVacante(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateVacanteDTO = req.body;

      const vacante = await JobsService.updateVacante(id, data);

      res.json({
        success: true,
        message: 'Vacante actualizada exitosamente',
        data: vacante,
      });
    } catch (error) {
      console.error('Error al actualizar vacante:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  }

  static async deleteVacante(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await JobsService.deleteVacante(id);

      res.json({
        success: true,
        message: 'Vacante eliminada exitosamente',
      });
    } catch (error) {
      console.error('Error al eliminar vacante:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  }
}