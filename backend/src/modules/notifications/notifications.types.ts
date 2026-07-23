/** Tipos de notificacion soportados por la plataforma. */
export const TIPOS_NOTIFICACION = [
  'postulacion', // cambios de estado de una postulacion
  'conexion',    // solicitudes / aceptaciones de conexion
  'match',       // recomendaciones de la IA
  'vacante',     // novedades de una vacante
  'sistema',     // avisos generales
] as const;

export type TipoNotificacion = (typeof TIPOS_NOTIFICACION)[number];

export interface Notificacion {
  id: string;
  usuario_id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  enlace: string | null;
  leida: boolean;
  created_at: Date;
}

/**
 * Datos para crear una notificacion.
 * Lo usan OTROS modulos (applications, connections, ai) a traves de
 * NotificationsService.crear(). No se expone como endpoint publico:
 * un usuario no debe poder crear notificaciones a nombre de otro.
 */
export interface CreateNotificacionDTO {
  usuario_id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  enlace?: string;
}

export interface NotificacionFilters {
  soloNoLeidas?: boolean;
  page?: number;
  limit?: number;
}

export interface NotificacionesPage {
  notificaciones: Notificacion[];
  total: number;
  noLeidas: number;
  page: number;
  limit: number;
}
