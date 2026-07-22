import { Router } from 'express';
import { ApplicationsController } from './applications.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();
router.use(authenticateToken);

router.post('/', ApplicationsController.createApplication);
router.get('/', ApplicationsController.getMyApplications);
router.get('/:id', ApplicationsController.getApplicationById);

export default router;
