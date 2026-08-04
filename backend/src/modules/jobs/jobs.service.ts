import { jobsDAO } from '../../daos/jobs.dao';
import { db } from '../../config/db';
import { sendNuevaVacanteEmail, sendJobApplicationEmail } from '../../utils/mailer';
import { CreateVacanteDTO, UpdateVacanteDTO, VacanteFilters, VacanteWithRelations } from './jobs.types';
import { NotificationsService } from '../notifications/notifications.service';

export class JobsService {
  static async createVacante(data: CreateVacanteDTO): Promise<VacanteWithRelations> {
    const vacante = await jobsDAO.createVacante(data);
    // Avisamos en segundo plano: si el correo falla, la vacante ya quedo creada.
    void JobsService.avisarAlumnosQueHacenMatch(vacante);
    return vacante;
  }

  /**
   * Avisa a cada alumno cuya carrera y cuatrimestre encajan con la vacante
   * recien publicada: por correo Y con una notificacion dentro de la
   * plataforma (antes solo se mandaba el correo, asi que si el alumno no lo
   * revisaba, se le perdia el aviso). Nunca lanza: un fallo aqui no debe
   * romper la creacion de la vacante.
   */
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
    const vacante = await jobsDAO.updateVacante(id, data);
    // Avisamos en segundo plano a quienes ya se postularon o guardaron la
    // vacante: un fallo al notificar no debe romper la edicion.
    void JobsService.avisarPostulantesDeEdicion(vacante);
    return vacante;
  }

  /**
   * Notifica (dentro de la plataforma) a los usuarios que tienen una
   * postulacion a esta vacante cuando el admin la edita, para que sepan que
   * la informacion pudo haber cambiado.
   */
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
    return jobsDAO.deleteVacante(id);
  }

  /**
   * Recordatorio de cierre próximo: avisa a quienes tienen una postulación
   * (o "me interesa") en una vacante cuando le quedan 3 días o 1 día o menos.
   * Se llama periódicamente (ver scheduler.ts). No repite el mismo aviso:
   * crearSiNoExiste usa el "enlace" (que incluye el umbral) para no duplicar.
   */
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