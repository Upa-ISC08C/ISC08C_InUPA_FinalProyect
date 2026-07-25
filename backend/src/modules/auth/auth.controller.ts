import { Request, Response } from 'express';
import { authService } from './auth.service';

export class AuthController {

  /**
   * Endpoint: POST /api/auth/register
   * Body: { "nombre_completo", "email", "password" }
   */
  async register(req: Request, res: Response) {
    try {
      const { nombre_completo, email, password } = req.body;

      if (!nombre_completo || !email || !password) {
        return res.status(400).json({ error: 'Nombre, correo y contraseña son requeridos' });
      }

      const { token: accessToken, user } = await authService.register(nombre_completo, email, password);

      return res.status(201).json({
        message: 'Cuenta creada exitosamente',
        accessToken,
        user
      });
    } catch (error: any) {
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
      return res.status(401).json({ error: error.message || 'No se pudo iniciar sesión con Google' });
    }
  }
}

export const authController = new AuthController();
