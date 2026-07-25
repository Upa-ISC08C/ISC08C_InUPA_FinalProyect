// ==========================================================================
// EXPERIENCIA LABORAL
// ==========================================================================
export interface Experiencia {
  id: string;
  perfil_id: string;
  empresa_nombre: string | null;
  puesto: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  actual: boolean;
  descripcion: string | null;
  tipo_contrato: string | null;
  tecnologias_usadas: string[] | null;
}

export interface CreateExperienciaDTO {
  puesto: string;
  empresa_nombre?: string;
  fecha_inicio: string;
  fecha_fin?: string | null;
  actual?: boolean;
  descripcion?: string;
  tipo_contrato?: string;
  tecnologias_usadas?: string[];
}
export type UpdateExperienciaDTO = Partial<CreateExperienciaDTO>;

// ==========================================================================
// EDUCACION
// ==========================================================================
export interface Educacion {
  id: string;
  perfil_id: string;
  institucion: string;
  carrera_o_grado: string;
  nivel_estudios: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  graduado: boolean;
  promedio: number | null;
}

export interface CreateEducacionDTO {
  institucion: string;
  carrera_o_grado: string;
  nivel_estudios?: string;
  fecha_inicio: string;
  fecha_fin?: string | null;
  graduado?: boolean;
  promedio?: number | null;
}
export type UpdateEducacionDTO = Partial<CreateEducacionDTO>;

// ==========================================================================
// PROYECTOS DE PORTAFOLIO
// ==========================================================================
export interface Proyecto {
  id: string;
  perfil_id: string;
  nombre_proyecto: string;
  descripcion: string | null;
  url_repositorio: string | null;
  url_despliegue: string | null;
  fecha_realizacion: string | null;
  tecnologias: string[] | null;
  rol_en_proyecto: string | null;
}

export interface CreateProyectoDTO {
  nombre_proyecto: string;
  descripcion?: string;
  url_repositorio?: string;
  url_despliegue?: string;
  fecha_realizacion?: string | null;
  tecnologias?: string[];
  rol_en_proyecto?: string;
}
export type UpdateProyectoDTO = Partial<CreateProyectoDTO>;

// ==========================================================================
// HABILIDADES DEL PERFIL
// ==========================================================================
export interface HabilidadPerfil {
  id: string; // id de PERFIL_HABILIDADES
  habilidad_id: string;
  nombre: string;
  nivel: string | null;
  anos_experiencia: number | null;
}

export interface AddHabilidadDTO {
  nombre: string;
  nivel?: string;
  anos_experiencia?: number;
}
