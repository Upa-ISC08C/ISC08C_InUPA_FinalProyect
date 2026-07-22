//nota porque no me deja subirlo a git

import { Request, Response } from 'express';
import { ConnectionsService } from './connections.service';
import { CreateConnectionDTO, ConnectionFilters } from './connections.types';

export class ConnectionsController {
  static async createConnection(req: Request, res: Response) {
    try {
      const data: CreateConnectionDTO = req.body;
      const connection = await ConnectionsService.createConnection(data);
      res.status(201).json({ success: true, data: connection });
    } catch (error: any) {
      if (error.message.includes('Ya existe') || error.message.includes('No puedes')) {
        return res.status(409).json({ success: false, error: error.message });
      }
      res.status(500).json({ success: false, error: 'Error al crear la conexión' });
    }
  }

  static async getConnections(req: Request, res: Response) {
    try {
      const filters: ConnectionFilters = {
        follower_id: typeof req.query.follower_id === 'string' ? req.query.follower_id : undefined,
        following_id: typeof req.query.following_id === 'string' ? req.query.following_id : undefined,
        page: typeof req.query.page === 'string' ? parseInt(req.query.page) : 1,
        limit: typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 10,
      };

      const { connections, total } = await ConnectionsService.getConnections(filters);
      res.json({ success: true, data: connections, total, page: filters.page });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al obtener conexiones' });
    }
  }

  static async deleteConnection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await ConnectionsService.deleteConnection(id);
      res.json({ success: true, message: 'Conexión eliminada' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al eliminar la conexión' });
    }
  }
}