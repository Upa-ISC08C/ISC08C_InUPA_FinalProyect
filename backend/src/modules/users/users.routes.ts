import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../middlewares/error.middleware';

const router = Router();

// Todas las rutas de usuarios requieren token: siempre operan sobre el
// usuario autenticado (el id se toma del token, nunca del cliente).
router.use(authenticateToken);

router.get('/me', asyncHandler(UsersController.getMe));
router.put('/me', asyncHandler(UsersController.updateMe));

export default router;
