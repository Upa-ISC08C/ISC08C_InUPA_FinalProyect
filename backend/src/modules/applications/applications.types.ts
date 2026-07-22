export interface CreateApplicationDTO {
  perfil_id: string;
  vacante_id: string;
  cv_adaptado_id?: string;
  carta_presentacion?: string;
}

export interface UpdateApplicationDTO {
  estado?: 'pendiente' | 'revisada' | 'aceptada' | 'rechazada';
}

export interface ApplicationFilters {
  perfil_id?: string;
  vacante_id?: string;
  estado?: string;
  page?: number;
  limit?: number;
}
