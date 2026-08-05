import { jobsDAO } from '../../daos/jobs.dao';
import { db } from '../../config/db';
import { sendNuevaVacanteEmail, sendJobApplicationEmail } from '../../utils/mailer';
import { CreateVacanteDTO, UpdateVacanteDTO, VacanteFilters, VacanteWithRelations } from './jobs.types';
import { NotificationsService } from '../notifications/notifications.service';
import { activityLogDAO } from '../../daos/activityLog.dao';
import { noEsFechaPasada } from './jobs.schemas';
import { ValidationError } from '../../shared/errors';

export class JobsService {
  static async createVacante(data: CreateVacanteDTO): Promise<VacanteWithRelations> {
    const vacante = await jobsDAO.createVacante(data);
    // Avisamos en segundo plano: si el correo falla, la vacante ya quedo creada.
    void JobsService.avisarAlumnosQueHacenMatch(vacante);
    return vacante;
  }

  /** Avisa por correo y notificación a los alumnos que hacen match con la vacante. Nunca lanza. */
  static async avisarAlumnosQueHacenMatch(vacante: VacanteWithRelations): Promise<number> {
    try {
      if (!vacante.activa) return 0;

      const alumnos = await jobsDAO.findAlumnosQueHacenMatch(vacante.carreras, vacante.cuatrimestre);
      if (alumnos.length === 0) return 0;

      const datos = {
        titulo: vacante.titulo,
        empresa: vacante.empresa?.nombre ?? null,
        ubicacion: vacante.ubicacion,
        modalidad: vacante.modalidad,
        fecha_limite: vacante.fecha_limite,
      };

      const resultados = await Promise.all(
        alumnos.map((a) =>
          sendNuevaVacanteEmail(a.correo_institucional, a.nombre_completo, datos).catch(() => false)
        )
      );
      const enviados = resultados.filter(Boolean).length;

      await Promise.all(
        alumnos.map((a) =>
          NotificationsService.crearSilencioso({
            usuario_id: a.id,
            tipo: 'match',
            titulo: 'Nueva vacante para tu perfil',
            mensaje: `"${vacante.titulo}"${vacante.empresa?.nombre ? ` de ${vacante.empresa.nombre}` : ''} podría interesarte.`,
            enlace: `/dashboard/empleos`,
          })
        )
      );

      console.log(`[vacantes] "${vacante.titulo}": ${alumnos.length} alumnos hacen match, ${enviados} correos enviados.`);
      return enviados;
    } catch (error: any) {
      console.error('[vacantes] No se pudo avisar a los alumnos:', error.message);
      return 0;
    }
  }

  static async getVacantes(filters: VacanteFilters) {
    return jobsDAO.getVacantes(filters);
  }

  static async getRecentVacantes(limit: number = 10) {
    return jobsDAO.getRecentVacantes(limit);
  }

  static async getVacanteById(id: string): Promise<VacanteWithRelations | null> {
    return jobsDAO.getVacanteById(id);
  }

  static async updateVacante(id: string, data: UpdateVacanteDTO): Promise<VacanteWithRelations> {
    // solo se valida si la fecha realmente cambia, para no bloquear ediciones de vacantes ya vencidas
    if (data.fecha_limite) {
      const actual = await jobsDAO.getVacanteById(id);
      const mismaFecha = actual?.fecha_limite
        && new Date(actual.fecha_limite).toDateString() === new Date(data.fecha_limite).toDateString();
      if (!mismaFecha && !noEsFechaPasada(data.fecha_limite)) {
        throw new ValidationError('La fecha límite no puede ser anterior a hoy');
      }
    }
    const vacante = await jobsDAO.updateVacante(id, data);
    await activityLogDAO.registrar('vacante_editada', vacante.titulo, vacante.empresa?.nombre);
    void JobsService.avisarPostulantesDeEdicion(vacante);
    return vacante;
  }

  /** Notifica a los postulantes de una vacante cuando el admin la edita. */
  static async avisarPostulantesDeEdicion(vacante: VacanteWithRelations): Promise<number> {
    try {
      const postulantes = await jobsDAO.findPostulantes(vacante.id);
      if (postulantes.length === 0) return 0;

      await Promise.all(
        postulantes.map((p) =>
          NotificationsService.crearSilencioso({
            usuario_id: p.usuario_id,
            tipo: 'vacante',
            titulo: 'Una vacante que sigues fue actualizada',
            mensaje: `La vacante "${vacante.titulo}"${vacante.empresa?.nombre ? ` de ${vacante.empresa.nombre}` : ''} tiene cambios recientes. Revisa los detalles.`,
            enlace: `/dashboard/empleos`,
          })
        )
      );
      return postulantes.length;
    } catch (error: any) {
      console.error('[vacantes] No se pudo notificar la edicion a los postulantes:', error.message);
      return 0;
    }
  }

  static async contactCompany(userId: string, vacanteId: string, mensaje: string) {
    const vacante = await jobsDAO.getVacanteById(vacanteId);
    if (!vacante) throw new Error('Vacante no encontrada');
    
    const empresa = await db.query('SELECT correo_contacto, nombre FROM EMPRESAS WHERE id = $1', [vacante.empresa_id]);
    const toEmail = empresa.rows[0]?.correo_contacto;
    if (!toEmail) throw new Error('Empresa sin correo de contacto');

    const user = await db.query('SELECT nombre_completo, correo_institucional FROM USUARIOS WHERE id = $1', [userId]);
    const u = user.rows[0];

    const finalMessage = mensaje || `Hola, soy ${u.nombre_completo} y me interesa la vacante ${vacante.titulo}.`;

    await sendJobApplicationEmail(
      toEmail,
      { nombre_completo: u.nombre_completo, correo_institucional: u.correo_institucional },
      { titulo: vacante.titulo, empresa: empresa.rows[0].nombre },
      finalMessage
    );
  }


  static async deleteVacante(id: string): Promise<boolean> {
    const vacante = await jobsDAO.getVacanteById(id);
    const eliminada = await jobsDAO.deleteVacante(id);
    if (eliminada && vacante) {
      await activityLogDAO.registrar('vacante_eliminada', vacante.titulo, vacante.empresa?.nombre);
    }
    return eliminada;
  }

  /** Avisa (una sola vez por umbral) cuando a una vacante le quedan 3 días o 1 día o menos. */
  static async revisarFechasLimite(): Promise<void> {
    try {
      const vacantes = await jobsDAO.getVacantesActivasConFechaLimite();
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      for (const v of vacantes) {
        const limite = new Date(v.fecha_limite);
        limite.setHours(0, 0, 0, 0);
        const diasRestantes = Math.round((limite.getTime() - hoy.getTime()) / 86400000);

        let umbral: '3' | '1' | null = null;
        let mensaje = '';
        if (diasRestantes === 3) {
          umbral = '3';
          mensaje = `"${v.titulo}"${v.empresa_nombre ? ` de ${v.empresa_nombre}` : ''} cierra en 3 días. No se te olvide postularte.`;
        } else if (diasRestantes <= 1 && diasRestantes >= 0) {
          umbral = '1';
          mensaje = diasRestantes === 0
            ? `"${v.titulo}"${v.empresa_nombre ? ` de ${v.empresa_nombre}` : ''} cierra hoy.`
            : `"${v.titulo}"${v.empresa_nombre ? ` de ${v.empresa_nombre}` : ''} cierra mañana.`;
        }
        if (!umbral) continue;

        const postulantes = await jobsDAO.findPostulantes(v.id);
        if (postulantes.length === 0) continue;

        await Promise.all(
          postulantes.map((p) =>
            NotificationsService.crearSiNoExiste({
              usuario_id: p.usuario_id,
              tipo: 'vacante',
              titulo: 'Una vacante que sigues está por cerrar',
              mensaje,
              enlace: `/dashboard/empleos?v=${v.id}&d=${umbral}`,
            })
          )
        );
      }
    } catch (error: any) {
      console.error('[vacantes] No se pudo revisar fechas límite:', error.message);
    }
  }
}