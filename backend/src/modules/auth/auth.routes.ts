import { Router } from 'express';
import { authController } from './auth.controller';

const router = Router();

// Registro clásico (correo institucional + contraseña)
router.post('/register', authController.register.bind(authController));

// Inicio de sesión clásico (correo institucional + contraseña)
router.post('/login', authController.login.bind(authController));

// Endpoint para solicitar el token (enviar correo)
router.post('/request-token', authController.requestToken.bind(authController));

// Endpoint para verificar el token (iniciar sesión / crear usuario)
router.post('/verify-token', authController.verifyToken.bind(authController));

// Recuperación de contraseña por código enviado al correo
router.post('/forgot-password', authController.forgotPassword.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));

// Verificación de correo
router.post('/verify-email', authController.verifyEmail.bind(authController));
router.post('/resend-verification', authController.resendVerification.bind(authController));

// Endpoint para iniciar sesión con Google (verifica el ID token de Google)
router.post('/google', authController.googleLogin.bind(authController));

export default router;
