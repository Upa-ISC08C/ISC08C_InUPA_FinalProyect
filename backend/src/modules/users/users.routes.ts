import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticateToken, requireAdmin } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../middlewares/error.middleware';

const router = Router();

// Todas las rutas de usuarios requieren token.
router.use(authenticateToken);

// --- Usuario autenticado (sobre si mismo; el id sale del token) ---
router.get('/me', asyncHandler(UsersController.getMe));
router.put('/me', asyncHandler(UsersController.updateMe));

// --- Administracion (solo admin) ---
// Nota: /me se define ANTES que /:id para que no lo capture el parametro.
router.get('/dashboard/admin', requireAdmin, asyncHandler(UsersController.dashboardStats));
router.get('/', requireAdmin, asyncHandler(UsersController.list));
router.get('/:id', requireAdmin, asyncHandler(UsersController.adminGetUser));
router.put('/:id', requireAdmin, asyncHandler(UsersController.adminUpdate));
router.post('/:id/reset-password', requireAdmin, asyncHandler(UsersController.adminResetPassword));
router.delete('/:id', requireAdmin, asyncHandler(UsersController.remove));

export default router;
