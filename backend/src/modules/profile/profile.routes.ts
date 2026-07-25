import { Router } from 'express';
import { ProfileController } from './profile.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../middlewares/error.middleware';

/**
 * /api/profile — perfil profesional del usuario AUTENTICADO.
 * El id del perfil se resuelve desde el token; el cliente nunca lo envia.
 */
const router = Router();

router.use(authenticateToken);

router.get('/me', asyncHandler(ProfileController.getMe));

// Experiencia
router.post('/experience', asyncHandler(ProfileController.addExperiencia));
router.put('/experience/:id', asyncHandler(ProfileController.updateExperiencia));
router.delete('/experience/:id', asyncHandler(ProfileController.deleteExperiencia));

// Educacion
router.post('/education', asyncHandler(ProfileController.addEducacion));
router.put('/education/:id', asyncHandler(ProfileController.updateEducacion));
router.delete('/education/:id', asyncHandler(ProfileController.deleteEducacion));

// Proyectos
router.post('/projects', asyncHandler(ProfileController.addProyecto));
router.put('/projects/:id', asyncHandler(ProfileController.updateProyecto));
router.delete('/projects/:id', asyncHandler(ProfileController.deleteProyecto));

// Habilidades
router.post('/skills', asyncHandler(ProfileController.addHabilidad));
router.delete('/skills/:id', asyncHandler(ProfileController.deleteHabilidad));

export default router;
