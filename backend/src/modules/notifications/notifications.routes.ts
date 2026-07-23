import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

// Todas las rutas operan sobre las notificaciones del usuario autenticado.
router.use(authenticateToken);

router.get('/', NotificationsController.listar);
router.get('/unread-count', NotificationsController.contarNoLeidas);

// read-all va ANTES de /:id/read para que "read-all" no se interprete como un id.
router.patch('/read-all', NotificationsController.marcarTodasLeidas);
router.patch('/:id/read', NotificationsController.marcarLeida);

// NOTA: no se expone POST para crear notificaciones. Un usuario no debe poder
// crear avisos a nombre de otro. Los demas modulos usan NotificationsService.crear().

export default router;
