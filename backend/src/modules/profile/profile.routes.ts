import { Router } from 'express';
import { ProfileController } from './profile.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../middlewares/error.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  addExperienciaSchema,
  updateExperienciaSchema,
  addEducacionSchema,
  updateEducacionSchema,
  addProyectoSchema,
  updateProyectoSchema,
  addHabilidadSchema,
  idParamsSchema
} from './profile.schemas';

/**
 * /api/profile — perfil profesional del usuario AUTENTICADO.
 * El id del perfil se resuelve desde el token; el cliente nunca lo envia.
 */
const router = Router();

router.use(authenticateToken);

router.get('/me', asyncHandler(ProfileController.getMe));

// Experiencia
router.post('/experience', validate(addExperienciaSchema), asyncHandler(ProfileController.addExperiencia));
router.put('/experience/:id', validate(updateExperienciaSchema), asyncHandler(ProfileController.updateExperiencia));
router.delete('/experience/:id', validate(idParamsSchema), asyncHandler(ProfileController.deleteExperiencia));

// Educacion
router.post('/education', validate(addEducacionSchema), asyncHandler(ProfileController.addEducacion));
router.put('/education/:id', validate(updateEducacionSchema), asyncHandler(ProfileController.updateEducacion));
router.delete('/education/:id', validate(idParamsSchema), asyncHandler(ProfileController.deleteEducacion));

// Proyectos
router.post('/projects', validate(addProyectoSchema), asyncHandler(ProfileController.addProyecto));
router.put('/projects/:id', validate(updateProyectoSchema), asyncHandler(ProfileController.updateProyecto));
router.delete('/projects/:id', validate(idParamsSchema), asyncHandler(ProfileController.deleteProyecto));

// Habilidades
router.post('/skills', validate(addHabilidadSchema), asyncHandler(ProfileController.addHabilidad));
router.delete('/skills/:id', validate(idParamsSchema), asyncHandler(ProfileController.deleteHabilidad));

export default router;
