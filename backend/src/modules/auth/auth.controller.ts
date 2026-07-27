import { Request, Response } from 'express';
import { authService } from './auth.service';

export class AuthController {

  /**
   * Endpoint: POST /api/auth/register
   * Body: { "nombre_completo", "email", "password" }
   */
  async register(req: Request, res: Response) {
    try {
      const { nombre_completo, email, password, matricula_o_rfc, carrera, cuatrimestre } = req.body;

      if (!nombre_completo || !email || !password) {
        return res.status(400).json({ error: 'Nombre, correo y contraseña son requeridos' });
      }

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
    } catch (error: any) {
      if (error?.message?.includes('duplicate key') || error?.code === '23505') {
        return res.status(400).json({ error: 'La matrícula o correo ingresado ya se encuentra registrado. Por favor, inicia sesión con tu cuenta existente o recupera tu contraseña.' });
      }
      return res.status(400).json({ error: error.message || 'No se pudo crear la cuenta' });
    }
  }

  /**
   * Endpoint: POST /api/auth/login
   * Body: { "correo_institucional" | "email", "password" }
   */
  async login(req: Request, res: Response) {
    try {
      const email = req.body.correo_institucional ?? req.body.email;
      const { password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
      }

      const { token: accessToken, user } = await authService.loginWithPassword(email, password);

      return res.status(200).json({
        message: 'Autenticación exitosa',
        accessToken,
        user
      });
    } catch (error: any) {
      return res.status(401).json({ error: error.message || 'Credenciales inválidas' });
    }
  }

  /**
   * Endpoint: POST /api/auth/request-token
   * Body: { "email": "up200000@alumnos.upa.edu.mx" }
   */
  async requestToken(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'El email es requerido' });
      }

      const success = await authService.requestToken(email);
      
      if (success) {
        return res.status(200).json({ message: 'Token OTP enviado exitosamente al correo' });
      } else {
        return res.status(500).json({ error: 'Error al enviar el correo con el token' });
      }
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Error en la solicitud' });
    }
  }

  /**
   * Endpoint: POST /api/auth/verify-token
   * Body: { "email": "up200000@alumnos.upa.edu.mx", "token": "123456" }
   */
  async verifyToken(req: Request, res: Response) {
    try {
      const { email, token } = req.body;
      
      if (!email || !token) {
        return res.status(400).json({ error: 'El email y el token son requeridos' });
      }

      const { token: accessToken, user } = await authService.verifyToken(email, token);

      return res.status(200).json({
        message: 'Autenticación exitosa',
        accessToken,
        user
      });
    } catch (error: any) {
      return res.status(401).json({ error: error.message || 'Credenciales inválidas' });
    }
  }

  /**
   * Endpoint: POST /api/auth/forgot-password
   * Body: { "email" }
   */
  async forgotPassword(req: Request, res: Response) {
    try {
      const email = req.body.correo_institucional ?? req.body.email;
      if (!email) return res.status(400).json({ error: 'El correo es requerido' });
      const enviado = await authService.forgotPassword(email);
      // Respuesta genérica: no revela si el correo existe. Pero si el envío falló
      // lo decimos, para no dejar al usuario esperando un correo que nunca llega.
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
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Error en la solicitud' });
    }
  }

  /**
   * Endpoint: POST /api/auth/verify-reset-token
   * Body: { "email", "token" }
   */
  async verifyResetToken(req: Request, res: Response) {
    try {
      const email = req.body.correo_institucional ?? req.body.email;
      const { token } = req.body;
      if (!email || !token) return res.status(400).json({ error: 'Correo y código son requeridos' });
      await authService.verifyResetToken(email, token);
      return res.status(200).json({ message: 'Código válido' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Código inválido' });
    }
  }

  /**
   * Endpoint: POST /api/auth/reset-password
   * Body: { "email", "token", "password" }
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const email = req.body.correo_institucional ?? req.body.email;
      const { token, password } = req.body;
      if (!email || !token || !password) return res.status(400).json({ error: 'Correo, código y nueva contraseña son requeridos' });
      await authService.resetPassword(email, token, password);
      return res.status(200).json({ message: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'No se pudo restablecer la contraseña' });
    }
  }

  /**
   * Endpoint: POST /api/auth/verify-email
   * Body: { "email", "token" }
   */
  async verifyEmail(req: Request, res: Response) {
    try {
      const email = req.body.correo_institucional ?? req.body.email;
      const { token } = req.body;
      if (!email || !token) return res.status(400).json({ error: 'Correo y código son requeridos' });
      await authService.verifyEmail(email, token);
      return res.status(200).json({ message: 'Correo verificado correctamente' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'No se pudo verificar el correo' });
    }
  }

  /**
   * Endpoint: POST /api/auth/resend-verification
   * Body: { "email" }
   */
  async resendVerification(req: Request, res: Response) {
    try {
      const email = req.body.correo_institucional ?? req.body.email;
      if (!email) return res.status(400).json({ error: 'El correo es requerido' });
      await authService.enviarVerificacion(email);
      return res.status(200).json({ message: 'Código de verificación enviado' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Error en la solicitud' });
    }
  }

  /**
   * Endpoint: POST /api/auth/google
   * Body: { "idToken": "<ID token que devuelve Google Identity Services>" }
   */
  async googleLogin(req: Request, res: Response) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ error: 'El idToken de Google es requerido' });
      }

      const { token: accessToken, user } = await authService.loginWithGoogle(idToken);

      return res.status(200).json({
        message: 'Autenticación con Google exitosa',
        accessToken,
        user
      });
    } catch (error: any) {
      if (error?.message?.includes('duplicate key') || error?.code === '23505') {
        return res.status(401).json({ error: 'La cuenta de Google coincide con una matrícula ya registrada bajo otro correo. Por favor, inicia sesión con la cuenta original.' });
      }
      return res.status(401).json({ error: error.message || 'No se pudo iniciar sesión con Google' });
    }
  }
}

export const authController = new AuthController();
