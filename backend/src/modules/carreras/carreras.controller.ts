import { Request, Response } from 'express';
import { CarrerasService } from './carreras.service';

export class CarrerasController {
  static async getAll(req: Request, res: Response) {
    try {
      const carreras = await CarrerasService.getAll();
      res.json({ success: true, data: carreras });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { nombre } = req.body;
      const carrera = await CarrerasService.create(nombre);
      res.status(201).json({ success: true, data: carrera });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nombre } = req.body;
      const carrera = await CarrerasService.update(id, nombre);
      res.json({ success: true, data: carrera });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await CarrerasService.delete(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}