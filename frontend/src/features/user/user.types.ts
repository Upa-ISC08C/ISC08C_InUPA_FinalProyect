export interface User {
  id: string;
  matricula_o_rfc: string;
  nombre_completo: string;
  correo_institucional: string;
  rol?: string;
  url_foto?: string | null;
  activo?: boolean;
}

export interface UserStats {
  totalApplications: number;
  applicationsByState: {
    pendiente?: number;
    revisada?: number;
    aceptada?: number;
    rechazada?: number;
  };
  cvCompletion: number;
  cvDetails: {
    basics: boolean;
    education: number;
    experience: number;
    skills: number;
    projects: number;
  };
  recommendedJobs: any[];
}

export interface UserStatsResponse {
  success: boolean;
  data: UserStats;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  message?: string;
}