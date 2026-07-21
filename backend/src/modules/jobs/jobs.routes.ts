import { Router } from 'express';
import { JobsController } from './jobs.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

// ==========================================
// Rutas PÚBLICAS (Cualquiera puede consultar)
// ==========================================
router.get('/', JobsController.getVacantes);
router.get('/recent', JobsController.getRecentVacantes);
router.get('/:id', JobsController.getVacanteById);

// ==========================================
// Rutas PROTEGIDAS (Requieren token válido)
// ==========================================
router.post('/', authenticateToken, JobsController.createVacante);
router.put('/:id', authenticateToken, JobsController.updateVacante);
router.delete('/:id', authenticateToken, JobsController.deleteVacante);

export default router;