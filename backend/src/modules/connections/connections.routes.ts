import { Router } from 'express';
import { ConnectionsController } from './connections.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();
router.use(authenticateToken); // Todas las rutas de conexiones requieren token

router.post('/', ConnectionsController.createConnection);
router.get('/', ConnectionsController.getConnections);
router.delete('/:id', ConnectionsController.deleteConnection);

export default router;