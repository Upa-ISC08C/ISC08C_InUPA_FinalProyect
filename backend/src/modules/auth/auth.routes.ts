import { Router } from 'express';
import { authController } from './auth.controller';

const router = Router();

// Endpoint para solicitar el token (enviar correo)
router.post('/request-token', authController.requestToken.bind(authController));

// Endpoint para verificar el token (iniciar sesión / crear usuario)
router.post('/verify-token', authController.verifyToken.bind(authController));

export default router;
