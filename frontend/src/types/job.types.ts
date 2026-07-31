export type JobModality = "presencial" | "remoto" | "hibrido";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  modality: JobModality;
  category: string;
  description: string;
  publishedAt: string;
}

export type ApplicationStatus = "enviada" | "en_revision" | "entrevista" | "rechazada" | "aceptada";

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface JobFilters {
  search?: string;
  category?: string;
  modality?: JobModality;
}
