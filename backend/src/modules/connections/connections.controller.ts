import { Request, Response } from 'express';
import { ConnectionsService } from './connections.service';
import { CreateConnectionDTO, ConnectionFilters } from './connections.types';
import { AppError } from '../../shared/errors';

export class ConnectionsController {
  static async createConnection(req: Request, res: Response) {
    try {
      const data: CreateConnectionDTO = req.body;
      const connection = await ConnectionsService.createConnection(data);
      res.status(201).json({ success: true, data: connection });
    } catch (error: any) {
      if (error.message.includes('Ya existe') || error.message.includes('No puedes')) {
        throw new AppError(error.message, 409);
      }
      throw error;
    }
  }

  static async getConnections(req: Request, res: Response) {
    const filters: ConnectionFilters = req.query as unknown as ConnectionFilters;
    const { connections, total } = await ConnectionsService.getConnections(filters);
    res.json({ success: true, data: connections, total, page: filters.page || 1 });
  }

  static async deleteConnection(req: Request, res: Response) {
    const { id } = req.params;
    await ConnectionsService.deleteConnection(id);
    res.json({ success: true, message: 'Conexión eliminada' });
  }
}