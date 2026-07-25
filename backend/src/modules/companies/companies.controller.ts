import { Request, Response } from 'express';
import { CompaniesService } from './companies.service';

/**
 * Los metodos no llevan try/catch: se registran con `asyncHandler`, que envia
 * cualquier error al middleware `errorHandler`.
 */
export class CompaniesController {
  static async list(_req: Request, res: Response) {
    const empresas = await CompaniesService.list();
    return res.json({ success: true, data: empresas });
  }

  static async getById(req: Request, res: Response) {
    const empresa = await CompaniesService.getById(req.params.id);
    return res.json({ success: true, data: empresa });
  }

  static async create(req: Request, res: Response) {
    const empresa = await CompaniesService.create(req.body);
    return res.status(201).json({ success: true, data: empresa });
  }

  static async update(req: Request, res: Response) {
    const empresa = await CompaniesService.update(req.params.id, req.body);
    return res.json({ success: true, data: empresa });
  }

  static async remove(req: Request, res: Response) {
    await CompaniesService.remove(req.params.id);
    return res.json({ success: true, message: 'Empresa desactivada' });
  }
}
