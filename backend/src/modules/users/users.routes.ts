import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticateToken, requireAdmin } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../middlewares/error.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  updateUserProfileSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
  userIdParamsSchema
} from './users.schemas';

const router = Router();

// Todas las rutas de usuarios requieren token.
router.use(authenticateToken);

// --- Usuario autenticado (sobre si mismo; el id sale del token) ---
router.get('/me', asyncHandler(UsersController.getMe));
router.put('/me', validate(updateUserProfileSchema), asyncHandler(UsersController.updateMe));

// --- Administracion (solo admin) ---
// Nota: /me se define ANTES que /:id para que no lo capture el parametro.
router.get('/dashboard/admin', requireAdmin, asyncHandler(UsersController.dashboardStats));
router.get('/', requireAdmin, asyncHandler(UsersController.list));
router.post('/', requireAdmin, validate(adminCreateUserSchema), asyncHandler(UsersController.adminCreate));
router.get('/:id', requireAdmin, validate(userIdParamsSchema), asyncHandler(UsersController.adminGetUser));
router.put('/:id', requireAdmin, validate(adminUpdateUserSchema), asyncHandler(UsersController.adminUpdate));
router.delete('/:id', requireAdmin, validate(userIdParamsSchema), asyncHandler(UsersController.remove));

export default router;
