import { Router } from 'express';
import { ApplicationsController } from './applications.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../middlewares/error.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createApplicationSchema,
  applicationFiltersSchema,
  applicationIdParamsSchema
} from './applications.schemas';

const router = Router();
router.use(authenticateToken);

router.post('/', validate(createApplicationSchema), asyncHandler(ApplicationsController.createApplication));
router.get('/', validate(applicationFiltersSchema), asyncHandler(ApplicationsController.getMyApplications));
router.delete('/:id', validate(applicationIdParamsSchema), asyncHandler(ApplicationsController.deleteApplication));
router.get('/:id', validate(applicationIdParamsSchema), asyncHandler(ApplicationsController.getApplicationById));

export default router;
