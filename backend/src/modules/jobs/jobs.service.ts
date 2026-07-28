import { jobsDAO } from '../../daos/jobs.dao';
import { db } from '../../config/db';
import { sendNuevaVacanteEmail, sendJobApplicationEmail } from '../../utils/mailer';
import { CreateVacanteDTO, UpdateVacanteDTO, VacanteFilters, VacanteWithRelations } from './jobs.types';

export class JobsService {
  static async createVacante(data: CreateVacanteDTO): Promise<VacanteWithRelations> {
    const vacante = await jobsDAO.createVacante(data);
    // Avisamos en segundo plano: si el correo falla, la vacante ya quedo creada.
    void JobsService.avisarAlumnosQueHacenMatch(vacante);
    return vacante;
  }

  /**
   * Manda un correo a cada alumno cuya carrera y cuatrimestre encajan con la
   * vacante recien publicada. Nunca lanza: un fallo de correo no debe romper
   * la creacion de la vacante.
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
    return jobsDAO.updateVacante(id, data);
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
}