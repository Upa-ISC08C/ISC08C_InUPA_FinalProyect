import { db } from '../config/db';

export const activityLogDAO = {
  /** Nunca lanza: un fallo al registrar actividad no debe romper la operación principal. */
  async registrar(tipo: string, detalle: string, subdetalle?: string | null): Promise<void> {
    try {
      await db.query(
        'INSERT INTO ACTIVIDAD_LOG (tipo, detalle, subdetalle) VALUES ($1, $2, $3)',
        [tipo, detalle, subdetalle ?? null]
      );
    } catch (error: any) {
      console.error('[actividad_log] No se pudo registrar el evento:', error.message);
    }
  },
};
