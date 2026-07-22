import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    matricula: string;
  };
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token de acceso no proporcionado',
    });
  }

  // NUNCA usar un valor por defecto aqui: si JWT_SECRET no esta configurado,
  // se aceptarian tokens firmados con un secreto publico y cualquiera podria
  // suplantar a un usuario. Mejor fallar de forma explicita.
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({
      success: false,
      error: 'JWT_SECRET no está configurado en el servidor',
    });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Token inválido o expirado',
      });
    }

    (req as AuthenticatedRequest).user = user as any;
    next();
  });
};
