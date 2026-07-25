export const UPA_EMAIL_DOMAIN = "@alumnos.upa.edu.mx";

export const JOB_MODALITIES = ["presencial", "remoto", "hibrido"] as const;

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  enviada: "Enviada",
  en_revision: "En revisión",
  entrevista: "Entrevista",
  rechazada: "Rechazada",
  aceptada: "Aceptada",
};

export const ROUTES = {
  login: "/",
  dashboard: "/dashboard",
  cvBuilder: "/dashboard/cv-builder",
  jobs: "/dashboard/empleos",
  profile: "/dashboard/perfil",
  admin: "/admin",
} as const;
