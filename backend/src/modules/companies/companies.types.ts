export interface Company {
  id: string;
  nombre: string;
  industria: string | null;
  descripcion: string | null;
  sitio_web: string | null;
  logo_url: string | null;
  correo_contacto: string | null;
  telefono: string | null;
  ciudad: string | null;
  direccion: string | null;
  tamano: string | null;
  activa: boolean;
  created_at: Date;
}

export interface CreateCompanyDTO {
  nombre: string;
  industria?: string;
  descripcion?: string;
  sitio_web?: string;
  logo_url?: string;
  correo_contacto?: string;
  telefono?: string;
  ciudad?: string;
  direccion?: string;
  tamano?: string;
  activa?: boolean;
}

export type UpdateCompanyDTO = Partial<CreateCompanyDTO>;
