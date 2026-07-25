import { Router } from 'express';
import { CompaniesController } from './companies.controller';
import { authenticateToken, requireAdmin } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../middlewares/error.middleware';

const router = Router();

// Todas las rutas requieren sesion iniciada.
router.use(authenticateToken);

// Consulta: cualquier usuario autenticado.
router.get('/', asyncHandler(CompaniesController.list));
router.get('/:id', asyncHandler(CompaniesController.getById));

// Gestion: solo administradores.
router.post('/', requireAdmin, asyncHandler(CompaniesController.create));
router.put('/:id', requireAdmin, asyncHandler(CompaniesController.update));
router.delete('/:id', requireAdmin, asyncHandler(CompaniesController.remove));

export default router;
