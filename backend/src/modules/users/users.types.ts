/**
 * Datos del usuario (tabla USUARIOS) unidos con su perfil (tabla PERFILES).
 * Nunca se expone password_hash.
 */
export interface UserProfile {
  id: string;
  matricula_o_rfc: string;
  nombre_completo: string;
  correo_institucional: string;
  activo: boolean;
  fecha_registro: Date;
  perfil: Perfil | null;
}

export interface Perfil {
  id: string;
  usuario_id: string;
  titular_profesional: string | null;
  biografia: string | null;
  url_cv_base: string | null;
  url_foto: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  telefono: string | null;
  ubicacion: string | null;
  disponibilidad: boolean;
  buscando_empleo: boolean;
  nivel_experiencia: string | null;
}

/**
 * Campos que el usuario puede actualizar de su propio perfil.
 * Deliberadamente NO incluye: id, matricula_o_rfc, correo_institucional ni activo
 * (no deben poder cambiarse desde el cliente).
 */
export interface UpdateUserProfileDTO {
  nombre_completo?: string;
  titular_profesional?: string;
  biografia?: string;
  url_foto?: string;
  github_url?: string;
  linkedin_url?: string;
  telefono?: string;
  ubicacion?: string;
  disponibilidad?: boolean;
  buscando_empleo?: boolean;
  nivel_experiencia?: string;
}

/** Campos del perfil que se pueden actualizar (whitelist usada por el DAO). */
export const CAMPOS_PERFIL_EDITABLES = [
  'titular_profesional',
  'biografia',
  'url_foto',
  'github_url',
  'linkedin_url',
  'telefono',
  'ubicacion',
  'disponibilidad',
  'buscando_empleo',
  'nivel_experiencia',
] as const;
