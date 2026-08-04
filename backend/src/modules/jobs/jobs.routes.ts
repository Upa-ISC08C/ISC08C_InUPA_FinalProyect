import { Router } from 'express';
import { JobsController } from './jobs.controller';
import { authenticateToken, requireAdmin } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { asyncHandler } from '../../middlewares/error.middleware';
import {
  createVacanteSchema,
  updateVacanteSchema,
  vacanteParamsSchema,
  vacanteFiltersSchema
} from './jobs.schemas';

const router = Router();

// ==========================================
// Rutas PÚBLICAS (Cualquiera puede consultar)
// ==========================================
router.get('/', validate(vacanteFiltersSchema), asyncHandler(JobsController.getVacantes));
router.get('/recent', asyncHandler(JobsController.getRecentVacantes));
router.get('/:id', validate(vacanteParamsSchema), asyncHandler(JobsController.getVacanteById));

// ==========================================
// Rutas PROTEGIDAS (Requieren token válido)
// ==========================================
router.post('/:id/contact', authenticateToken, validate(vacanteParamsSchema), asyncHandler(JobsController.contactCompany));
router.post('/', authenticateToken, requireAdmin, validate(createVacanteSchema), asyncHandler(JobsController.createVacante));
router.put('/:id', authenticateToken, requireAdmin, validate(updateVacanteSchema), asyncHandler(JobsController.updateVacante));
router.delete('/:id', authenticateToken, requireAdmin, validate(vacanteParamsSchema), asyncHandler(JobsController.deleteVacante));

export default router;