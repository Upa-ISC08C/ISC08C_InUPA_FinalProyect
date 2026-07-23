import { notificationsDAO } from '../../daos/notifications.dao';
import {
  Notificacion,
  CreateNotificacionDTO,
  NotificacionFilters,
  NotificacionesPage,
  TIPOS_NOTIFICACION,
} from './notifications.types';

/** Error de validacion: el controller lo traduce a HTTP 400. */
export class ValidationError extends Error {}
/** Recurso inexistente o ajeno: el controller lo traduce a HTTP 404. */
export class NotFoundError extends Error {}

export class NotificationsService {
  /**
   * Crea una notificacion. **Esta es la funcion que deben usar los demas
   * modulos** (applications, connections, ai) para avisar al usuario.
   *
   * Ejemplo desde applications al cambiar el estado de una postulacion:
   *   await NotificationsService.crear({
   *     usuario_id: idDelEstudiante,
   *     tipo: 'postulacion',
   *     titulo: 'Tu postulacion cambio de estado',
   *     mensaje: `Tu postulacion a "${vacante.titulo}" ahora esta: aceptada`,
   *     enlace: `/applications/${postulacionId}`,
   *   });
   */
  static async crear(data: CreateNotificacionDTO): Promise<Notificacion> {
    if (!data.usuario_id) {
      throw new ValidationError('usuario_id es requerido');
    }
    if (!TIPOS_NOTIFICACION.includes(data.tipo)) {
      throw new ValidationError(
        `Tipo de notificacion invalido. Validos: ${TIPOS_NOTIFICACION.join(', ')}`
      );
    }
    if (!data.titulo?.trim()) {
      throw new ValidationError('El titulo es requerido');
    }
    if (!data.mensaje?.trim()) {
      throw new ValidationError('El mensaje es requerido');
    }

    return notificationsDAO.create({
      ...data,
      titulo: data.titulo.trim(),
      mensaje: data.mensaje.trim(),
    });
  }

  /**
   * Version "a prueba de fallos" para disparar notificaciones desde otros
   * modulos: si algo falla, lo registra pero NO rompe la operacion principal.
   * Una postulacion no debe fallar solo porque la notificacion no se pudo crear.
   */
  static async crearSilencioso(data: CreateNotificacionDTO): Promise<Notificacion | null> {
    try {
      return await this.crear(data);
    } catch (error) {
      console.error('No se pudo crear la notificacion:', error);
      return null;
    }
  }

  /** Notificaciones del usuario autenticado. */
  static async listar(usuarioId: string, filters: NotificacionFilters): Promise<NotificacionesPage> {
    return notificationsDAO.findByUsuario(usuarioId, filters);
  }

  /** Contador para el badge de la campana. */
  static async contarNoLeidas(usuarioId: string): Promise<number> {
    return notificationsDAO.contarNoLeidas(usuarioId);
  }

  /**
   * Marca una notificacion como leida. Si no existe o es de otro usuario
   * se responde 404 (no se revela que la notificacion existe).
   */
  static async marcarLeida(id: string, usuarioId: string): Promise<Notificacion> {
    const actualizada = await notificationsDAO.marcarLeida(id, usuarioId);
    if (!actualizada) {
      throw new NotFoundError('Notificacion no encontrada');
    }
    return actualizada;
  }

  static async marcarTodasLeidas(usuarioId: string): Promise<number> {
    return notificationsDAO.marcarTodasLeidas(usuarioId);
  }
}
