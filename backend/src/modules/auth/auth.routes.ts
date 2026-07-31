import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { asyncHandler } from '../../middlewares/error.middleware';
import {
  registerSchema,
  loginSchema,
  requestTokenSchema,
  verifyTokenSchema,
  forgotPasswordSchema,
  verifyResetTokenSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  googleLoginSchema
} from './auth.schemas';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(authController.register.bind(authController)));
router.post('/login', validate(loginSchema), asyncHandler(authController.login.bind(authController)));
router.post('/request-token', validate(requestTokenSchema), asyncHandler(authController.requestToken.bind(authController)));
router.post('/verify-token', validate(verifyTokenSchema), asyncHandler(authController.verifyToken.bind(authController)));
router.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(authController.forgotPassword.bind(authController)));
router.post('/verify-reset-token', validate(verifyResetTokenSchema), asyncHandler(authController.verifyResetToken.bind(authController)));
router.post('/reset-password', validate(resetPasswordSchema), asyncHandler(authController.resetPassword.bind(authController)));
router.post('/verify-email', validate(verifyEmailSchema), asyncHandler(authController.verifyEmail.bind(authController)));
router.post('/resend-verification', validate(forgotPasswordSchema), asyncHandler(authController.resendVerification.bind(authController)));
router.post('/google', validate(googleLoginSchema), asyncHandler(authController.googleLogin.bind(authController)));

export default router;
