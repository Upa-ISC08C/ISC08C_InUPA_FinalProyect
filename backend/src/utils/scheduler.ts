import { JobsService } from '../modules/jobs/jobs.service';

const SEIS_HORAS_MS = 6 * 60 * 60 * 1000;

/** Tareas periódicas del backend (sin cron externo, con setInterval). */
export function iniciarTareasProgramadas() {
  setTimeout(() => void JobsService.revisarFechasLimite(), 30_000);
  setInterval(() => void JobsService.revisarFechasLimite(), SEIS_HORAS_MS);
}
