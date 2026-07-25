// Tipos que reflejan lo que devuelve NUESTRO backend (no los mock de Figma).

export interface AppUser {
  id: string;
  matricula_o_rfc: string;
  nombre_completo: string;
  correo_institucional: string;
  rol: string; // 'estudiante' | 'admin'
  url_foto?: string | null;
  activo?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: AppUser;
}

export interface Empresa {
  id: string;
  nombre: string;
  logo_url: string | null;
  sitio_web: string | null;
  descripcion: string | null;
}

export interface Vacante {
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
  empresa: Empresa;
  vacante_habilidades?: Array<{
    id: string;
    nivel_requerido: string | null;
    es_obligatoria: boolean;
    habilidad: { id: string; nombre: string };
  }>;
}

export interface Postulacion {
  id: string;
  vacante_id: string;
  estado: 'pendiente' | 'revisada' | 'aceptada' | 'rechazada';
  fecha_postulacion: string;
  vacante: {
    id: string;
    titulo: string;
    descripcion: string;
    modalidad: string | null;
    ubicacion: string | null;
    salario_min: number | null;
    salario_max: number | null;
    empresa: { id: string; nombre: string; logo_url: string | null };
  };
}

export interface Company {
  id: string;
  nombre: string;
  industria: string | null;
  descripcion: string | null;
  sitio_web: string | null;
  correo_contacto: string | null;
  telefono: string | null;
  ciudad: string | null;
  direccion: string | null;
  tamano: string | null;
  activa: boolean;
  created_at: string;
}

export interface AdminUser {
  id: string;
  matricula_o_rfc: string;
  nombre_completo: string;
  correo_institucional: string;
  rol: string;
  activo: boolean;
  fecha_registro: string;
  url_foto: string | null;
}

export interface UserStats {
  totalApplications: number;
  applicationsByState: Record<string, number>;
  cvCompletion: number;
  cvDetails: { basics: boolean; education: number; experience: number; skills: number; projects: number };
  recommendedJobs: Vacante[];
}
