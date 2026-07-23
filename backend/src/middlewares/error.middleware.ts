import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors';

/**
 * Envuelve un handler async para que sus errores lleguen al errorHandler
 * sin tener que escribir try/catch en cada controller.
 *
 *   router.get('/me', asyncHandler(UsersController.getMe));
 */
export const asyncHandler =
  (fn: (req: any, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * 404 para rutas que no existen. Se monta despues de todas las rutas.
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Manejador central de errores. Debe ser el ULTIMO middleware.
 *
 * - Los errores de dominio (AppError) se traducen a su statusCode.
 * - Cualquier otro error se responde como 500 con un mensaje generico:
 *   nunca se filtran detalles internos al cliente.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // next es obligatorio para que Express reconozca esto como error handler
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Error inesperado: se registra completo en el servidor...
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);

  // ...pero al cliente solo le llega un mensaje generico.
  return res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
  });
};
