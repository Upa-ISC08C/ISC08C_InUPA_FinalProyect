export interface Job {
  id: string;
  titulo: string;
  descripcion: string;
  requisitos: string;
  empresa_id: string;
  salario_min: number | null;
  salario_max: number | null;
  modalidad: string | null;
  tipo_contrato: string | null;
  nivel_experiencia: string | null;
  ubicacion: string | null;
  activa: boolean;
  fecha_publicacion: string;
  fecha_limite: string | null;
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

export interface JobsResponse {
  success: boolean;
  data: Job[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface JobFilters {
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