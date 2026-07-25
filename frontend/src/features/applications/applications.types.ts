export interface Application {
  id: string;
  perfil_id: string;
  vacante_id: string;
  estado: 'pendiente' | 'revisada' | 'aceptada' | 'rechazada';
  fecha_postulacion: string;
  vacante: {
    id: string;
    titulo: string;
    descripcion: string;
    requisitos: string;
    empresa: {
      id: string;
      nombre: string;
      logo_url: string | null;
    };
    modalidad: string | null;
    ubicacion: string | null;
    salario_min: number | null;
    salario_max: number | null;
  };
}

export interface ApplicationsResponse {
  success: boolean;
  data: Application[];
}