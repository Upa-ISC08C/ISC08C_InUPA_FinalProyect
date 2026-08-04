import { Router } from 'express';
import { CarrerasController } from './carreras.controller';
import { authenticateToken, requireAdmin } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../middlewares/error.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createCarreraSchema,
  updateCarreraSchema,
  carreraIdParamsSchema
} from './carreras.schemas';

const router = Router();
router.use(authenticateToken); // Protege todas las rutas

router.get('/', asyncHandler(CarrerasController.getAll));
router.post('/', requireAdmin, validate(createCarreraSchema), asyncHandler(CarrerasController.create));
router.put('/:id', requireAdmin, validate(updateCarreraSchema), asyncHandler(CarrerasController.update));
router.delete('/:id', requireAdmin, validate(carreraIdParamsSchema), asyncHandler(CarrerasController.delete));

export default router;