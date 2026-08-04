import { JobsService } from '../modules/jobs/jobs.service';

const SEIS_HORAS_MS = 6 * 60 * 60 * 1000;

/**
 * Tareas periódicas del backend. No hay un cron externo en este proyecto,
 * así que se corren con setInterval dentro del mismo proceso: alcanza para
 * un chequeo de "¿alguna vacante cierra pronto?" que no necesita precisión
 * al segundo, solo correr unas cuantas veces al día.
 */
export function iniciarTareasProgramadas() {
  // Un primer chequeo a los 30s de arrancar (deja que la conexión a la BD
  // termine de establecerse) y luego cada 6 horas.
  setTimeout(() => void JobsService.revisarFechasLimite(), 30_000);
  setInterval(() => void JobsService.revisarFechasLimite(), SEIS_HORAS_MS);
}
