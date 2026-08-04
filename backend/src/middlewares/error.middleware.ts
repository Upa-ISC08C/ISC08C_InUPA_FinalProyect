import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
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

  // Error de validación Zod: se muestran solo los mensajes (ya redactados en
  // español para cada campo), sin el prefijo tecnico "body.nombreDelCampo"
  // que no significa nada para quien usa la app. Tambien se quitan mensajes
  // duplicados (puede pasar cuando dos reglas fallan sobre el mismo campo).
  if (err && typeof err === 'object' && err.name === 'ZodError') {
    const zodErr = err as any;
    const errorsList = zodErr.errors || zodErr.issues || [];
    const mensajesUnicos = [...new Set(errorsList.map((e: any) => e.message as string))];
    const errorMessages = mensajesUnicos.join(". Además: ");
    return res.status(400).json({
      success: false,
      error: errorMessages || 'Revisa los datos enviados e intenta de nuevo.',
      details: errorsList,
    });
  }

  // Error nativo de Postgres (violación de constraints)
  const pgErr = err as any;
  if (pgErr.code && pgErr.code.length === 5) {
    if (pgErr.code === "23505") {
      return res.status(409).json({
        success: false,
        error: "Conflicto de datos: el registro ya existe.",
      });
    }
    if (pgErr.code === "23514") {
      return res.status(400).json({
        success: false,
        error: "Los datos enviados no cumplen con las reglas de la base de datos.",
      });
    }
  }

  // Error inesperado: se registra completo en el servidor...
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);

  // ...pero al cliente solo le llega un mensaje generico.
  return res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
  });
};
