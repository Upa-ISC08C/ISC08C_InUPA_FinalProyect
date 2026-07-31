import { Router } from 'express';
import { CompaniesController } from './companies.controller';
import { authenticateToken, requireAdmin } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../middlewares/error.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createCompanySchema,
  updateCompanySchema,
  companyIdParamsSchema
} from './companies.schemas';

const router = Router();

// Todas las rutas requieren sesion iniciada.
router.use(authenticateToken);

// Consulta: cualquier usuario autenticado.
router.get('/', asyncHandler(CompaniesController.list));
router.get('/:id', validate(companyIdParamsSchema), asyncHandler(CompaniesController.getById));

// Gestion: solo administradores.
router.post('/', requireAdmin, validate(createCompanySchema), asyncHandler(CompaniesController.create));
router.put('/:id', requireAdmin, validate(updateCompanySchema), asyncHandler(CompaniesController.update));
router.delete('/:id', requireAdmin, validate(companyIdParamsSchema), asyncHandler(CompaniesController.remove));

export default router;
