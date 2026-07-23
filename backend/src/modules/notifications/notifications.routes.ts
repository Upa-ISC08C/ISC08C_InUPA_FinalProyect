import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../middlewares/error.middleware';

const router = Router();

// Todas las rutas operan sobre las notificaciones del usuario autenticado.
router.use(authenticateToken);

router.get('/', asyncHandler(NotificationsController.listar));
router.get('/unread-count', asyncHandler(NotificationsController.contarNoLeidas));

// read-all va ANTES de /:id/read para que "read-all" no se interprete como un id.
router.patch('/read-all', asyncHandler(NotificationsController.marcarTodasLeidas));
router.patch('/:id/read', asyncHandler(NotificationsController.marcarLeida));

// NOTA: no se expone POST para crear notificaciones. Un usuario no debe poder
// crear avisos a nombre de otro. Los demas modulos usan NotificationsService.crear().

export default router;
