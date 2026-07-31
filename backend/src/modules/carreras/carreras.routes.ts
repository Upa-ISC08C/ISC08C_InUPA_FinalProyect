import { Router } from 'express';
import { CarrerasController } from './carreras.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
router.post('/', validate(createCarreraSchema), asyncHandler(CarrerasController.create));
router.put('/:id', validate(updateCarreraSchema), asyncHandler(CarrerasController.update));
router.delete('/:id', validate(carreraIdParamsSchema), asyncHandler(CarrerasController.delete));

export default router;