import { Router } from 'express';
import { ConnectionsController } from './connections.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../middlewares/error.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createConnectionSchema,
  connectionFiltersSchema,
  connectionIdParamsSchema
} from './connections.schemas';

const router = Router();
router.use(authenticateToken); // Todas las rutas de conexiones requieren token

router.post('/', validate(createConnectionSchema), asyncHandler(ConnectionsController.createConnection));
router.get('/', validate(connectionFiltersSchema), asyncHandler(ConnectionsController.getConnections));
router.delete('/:id', validate(connectionIdParamsSchema), asyncHandler(ConnectionsController.deleteConnection));

export default router;