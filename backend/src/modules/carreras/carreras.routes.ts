import { Router } from 'express';
import { CarrerasController } from './carreras.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();
router.use(authenticateToken); // Protege todas las rutas

router.get('/', CarrerasController.getAll);
router.post('/', CarrerasController.create);
router.put('/:id', CarrerasController.update);
router.delete('/:id', CarrerasController.delete);

export default router;