import { Request, Response, NextFunction } from 'express';

/**
 * Log de peticiones: metodo, ruta, codigo de respuesta y duracion.
 * Util para depurar en desarrollo y para ver que esta pasando en el runner de QA.
 *
 * No registra el body ni las cabeceras: podrian contener credenciales
 * (contrasenas, OTP, tokens).
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const inicio = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - inicio;
    const marca = res.statusCode >= 500 ? 'ERR' : res.statusCode >= 400 ? 'WRN' : 'OK ';
    console.log(`[${marca}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });

  next();
};
