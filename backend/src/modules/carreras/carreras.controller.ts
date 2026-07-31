import { Request, Response } from 'express';
import { CarrerasService } from './carreras.service';

export class CarrerasController {
  static async getAll(req: Request, res: Response) {
    const carreras = await CarrerasService.getAll();
    res.json({ success: true, data: carreras });
  }

  static async create(req: Request, res: Response) {
    const { nombre } = req.body;
    const carrera = await CarrerasService.create(nombre);
    res.status(201).json({ success: true, data: carrera });
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const { nombre } = req.body;
    const carrera = await CarrerasService.update(id, nombre);
    res.json({ success: true, data: carrera });
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    await CarrerasService.delete(id);
    res.json({ success: true });
  }
}