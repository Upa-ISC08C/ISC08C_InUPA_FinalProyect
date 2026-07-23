/**
 * Errores de dominio compartidos por todos los modulos.
 *
 * Los SERVICES lanzan estos errores; el middleware `errorHandler` los traduce
 * al codigo HTTP correspondiente. Asi los controllers no repiten bloques
 * try/catch con la misma logica de mapeo.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = new.target.name;
    Error.captureStackTrace?.(this, new.target);
  }
}

/** 400 — la peticion trae datos invalidos. */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

/** 401 — no hay sesion / token valido. */
export class UnauthorizedError extends AppError {
  constructor(message = 'No autenticado') {
    super(message, 401);
  }
}

/** 403 — hay sesion, pero el recurso no le corresponde al usuario. */
export class ForbiddenError extends AppError {
  constructor(message = 'No tienes permiso para realizar esta accion') {
    super(message, 403);
  }
}

/** 404 — el recurso no existe (o es de otro usuario y no se revela). */
export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

/** 409 — conflicto con el estado actual (duplicados, etc.). */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}
