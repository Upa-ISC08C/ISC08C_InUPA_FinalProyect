import { Request, Response } from 'express';
import { authService } from './auth.service';

export class AuthController {

  async register(req: Request, res: Response) {
    const { nombre_completo, email, password, matricula_o_rfc, carrera, cuatrimestre } = req.body;

    const { token: accessToken, user } = await authService.register({
      nombre: nombre_completo,
      email,
      password,
      matricula: matricula_o_rfc,
      carrera,
      cuatrimestre: cuatrimestre ? Number(cuatrimestre) : undefined,
    });

    return res.status(201).json({
      message: 'Cuenta creada exitosamente',
      accessToken,
      user
    });
  }

  async login(req: Request, res: Response) {
    const email = req.body.correo_institucional ?? req.body.email;
    const { password } = req.body;

    const { token: accessToken, user } = await authService.loginWithPassword(email, password);

    return res.status(200).json({
      message: 'Autenticación exitosa',
      accessToken,
      user
    });
  }

  async requestToken(req: Request, res: Response) {
    const { email } = req.body;
    
    const success = await authService.requestToken(email);
    
    if (success) {
      return res.status(200).json({ message: 'Token OTP enviado exitosamente al correo' });
    } else {
      return res.status(500).json({ error: 'Error al enviar el correo con el token' });
    }
  }

  async verifyToken(req: Request, res: Response) {
    const { email, token } = req.body;
    
    const { token: accessToken, user } = await authService.verifyToken(email, token);

    return res.status(200).json({
      message: 'Autenticación exitosa',
      accessToken,
      user
    });
  }

  async forgotPassword(req: Request, res: Response) {
    const email = req.body.correo_institucional ?? req.body.email;
    const enviado = await authService.forgotPassword(email);
    
    if (!enviado) {
      return res.status(200).json({
        message: 'Generamos el código, pero el envío de correo no está disponible. Contacta al administrador.',
        correoEnviado: false,
      });
    }
    return res.status(200).json({
      message: 'Si el correo existe, enviamos un código para restablecer la contraseña',
      correoEnviado: true,
    });
  }

  async verifyResetToken(req: Request, res: Response) {
    const email = req.body.correo_institucional ?? req.body.email;
    const { token } = req.body;
    
    await authService.verifyResetToken(email, token);
    return res.status(200).json({ message: 'Código válido' });
  }

  async resetPassword(req: Request, res: Response) {
    const email = req.body.correo_institucional ?? req.body.email;
    const { token, password } = req.body;
    
    await authService.resetPassword(email, token, password);
    return res.status(200).json({ message: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
  }

  async verifyEmail(req: Request, res: Response) {
    const email = req.body.correo_institucional ?? req.body.email;
    const { token } = req.body;
    
    await authService.verifyEmail(email, token);
    return res.status(200).json({ message: 'Correo verificado correctamente' });
  }

  async resendVerification(req: Request, res: Response) {
    const email = req.body.correo_institucional ?? req.body.email;
    
    await authService.enviarVerificacion(email);
    return res.status(200).json({ message: 'Código de verificación enviado' });
  }

  async googleLogin(req: Request, res: Response) {
    const { idToken } = req.body;

    const { token: accessToken, user } = await authService.loginWithGoogle(idToken);

    return res.status(200).json({
      message: 'Autenticación con Google exitosa',
      accessToken,
      user
    });
  }
}

export const authController = new AuthController();
