export interface CreateVacanteDTO {
  titulo: string;
  descripcion: string;
  requisitos: string;
  empresa_id: string;
  url_origen?: string;
  salario_min?: number;
  salario_max?: number;
  modalidad?: string;
  tipo_contrato?: string;
  nivel_experiencia?: string;
  ubicacion?: string;
  fecha_limite?: Date;
  habilidades_ids?: string[];
}

export interface UpdateVacanteDTO {
  titulo?: string;
  descripcion?: string;
  requisitos?: string;
  url_origen?: string;
  salario_min?: number;
  salario_max?: number;
  modalidad?: string;
  tipo_contrato?: string;
  nivel_experiencia?: string;
  ubicacion?: string;
  fecha_limite?: Date;
  activa?: boolean;
  habilidades_ids?: string[];
}

export interface VacanteFilters {
  activa?: boolean;
  modalidad?: string;
  tipo_contrato?: string;
  nivel_experiencia?: string;
  ubicacion?: string;
  salario_min?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface VacanteWithRelations {
  id: string;
  titulo: string;
  descripcion: string;
  requisitos: string;
  url_origen: string | null;
  empresa_id: string;
  salario_min: number | null;
  salario_max: number | null;
  modalidad: string | null;
  tipo_contrato: string | null;
  nivel_experiencia: string | null;
  ubicacion: string | null;
  activa: boolean;
  fecha_publicacion: Date;
  fecha_limite: Date | null;
  created_at: Date;
  empresa: {
    id: string;
    nombre: string;
    logo_url: string | null;
    sitio_web: string | null;
    descripcion: string | null;
  };
  vacante_habilidades?: Array<{
    id: string;
    nivel_requerido: string | null;
    es_obligatoria: boolean;
    habilidad: {
      id: string;
      nombre: string;
    };
  }>;
}