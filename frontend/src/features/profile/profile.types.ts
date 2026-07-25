export interface Perfil {
  id: string;
  usuario_id: string;
  titular_profesional: string | null;
  biografia: string | null;
  url_foto: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  telefono: string | null;
  ubicacion: string | null;
  disponibilidad: boolean;
  buscando_empleo: boolean;
  nivel_experiencia: string | null;
}

export interface Experiencia {
  id: string;
  empresa_nombre: string | null;
  puesto: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  actual: boolean;
  descripcion: string | null;
  tipo_contrato: string | null;
  tecnologias_usadas: string[] | null;
}

export interface Educacion {
  id: string;
  institucion: string;
  carrera_o_grado: string;
  nivel_estudios: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  graduado: boolean;
  promedio: number | null;
}

export interface Proyecto {
  id: string;
  nombre_proyecto: string;
  descripcion: string | null;
  url_repositorio: string | null;
  url_despliegue: string | null;
  fecha_realizacion: string | null;
  tecnologias: string[] | null;
  rol_en_proyecto: string | null;
}

export interface HabilidadPerfil {
  id: string;
  habilidad_id: string;
  nombre: string;
  nivel: string | null;
  anos_experiencia: number | null;
}

export interface FullProfile {
  id: string;
  matricula_o_rfc: string;
  nombre_completo: string;
  correo_institucional: string;
  perfil: Perfil;
  experiencia: Experiencia[];
  educacion: Educacion[];
  proyectos: Proyecto[];
  habilidades: HabilidadPerfil[];
}

/** Campos que se editan vía PUT /users/me */
export interface UpdateBasicsDTO {
  nombre_completo?: string;
  titular_profesional?: string;
  biografia?: string;
  url_foto?: string;
  github_url?: string;
  linkedin_url?: string;
  telefono?: string;
  ubicacion?: string;
  nivel_experiencia?: string;
  disponibilidad?: boolean;
  buscando_empleo?: boolean;
}
