import { Request, Response } from 'express';
import { authService } from './auth.service';

export class AuthController {
  
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

      const accessToken = await authService.verifyToken(email, token);
      
      return res.status(200).json({ 
        message: 'Autenticación exitosa',
        accessToken 
      });
    } catch (error: any) {
      return res.status(401).json({ error: error.message || 'Credenciales inválidas' });
    }
  }
}

export const authController = new AuthController();
