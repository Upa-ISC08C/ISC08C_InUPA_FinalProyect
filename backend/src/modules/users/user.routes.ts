import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../middlewares/error.middleware';

/**
 * Rutas montadas en /api/user (singular) para datos derivados del usuario
 * autenticado, como el resumen del dashboard.
 */
const router = Router();

router.use(authenticateToken);

router.get('/stats', asyncHandler(UsersController.getStats));

export default router;
