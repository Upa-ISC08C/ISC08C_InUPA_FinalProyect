import { usersDAO } from '../../daos/users.dao';
import { jobsDAO } from '../../daos/jobs.dao';
import { authService } from '../auth/auth.service';
import { UserProfile, UpdateUserProfileDTO } from './users.types';
import { ValidationError, NotFoundError } from '../../shared/errors';
import bcrypt from 'bcryptjs';

const URL_REGEX = /^https?:\/\/.+/i;
const ADMIN_PRINCIPAL_EMAIL = 'admin@upa.edu.mx';

export class UsersService {
  // ... (getProfile, updateProfile, getStats, listAll, adminDashboard se mantienen igual) ...

  static async getProfile(usuarioId: string): Promise<UserProfile> {
    const user = await usersDAO.findById(usuarioId);
    if (!user) throw new NotFoundError('Usuario no encontrado');
    if (!user.perfil) user.perfil = await usersDAO.ensurePerfil(usuarioId);
    return user;
  }

  static async updateProfile(usuarioId: string, data: UpdateUserProfileDTO): Promise<UserProfile> {
    this.validar(data);
    const user = await usersDAO.findById(usuarioId);
    if (!user) throw new NotFoundError('Usuario no encontrado');
    return usersDAO.updateProfile(usuarioId, data);
  }

  static async getStats(usuarioId: string) {
    const stats = await usersDAO.getStats(usuarioId);
    const recommendedJobs = await jobsDAO.getRecentVacantes(3);
    return { ...stats, recommendedJobs };
  }

  static async listAll() { return usersDAO.listAll(); }
  static async adminDashboard() { return usersDAO.dashboardStats(); }

  static async adminUpdate(
    id: string,
    data: { activo?: boolean; rol?: string; nombre_completo?: string; correo_institucional?: string; matricula_o_rfc?: string; password?: string; }
  ) {
    if (data.rol !== undefined && !['estudiante', 'admin'].includes(data.rol)) {
      throw new ValidationError('El rol debe ser "estudiante" o "admin"');
    }
    
    const actual = await usersDAO.findByIdForAdmin(id);
    if (!actual) throw new NotFoundError('Usuario no encontrado');

    // Validación de correo si se intenta cambiar
    if (data.correo_institucional) {
      const correo = data.correo_institucional.toLowerCase().trim();
      if (!correo.endsWith('@upa.edu.mx') && !correo.endsWith('@alumnos.upa.edu.mx')) {
        throw new ValidationError('El correo debe ser institucional (@upa.edu.mx o @alumnos.upa.edu.mx)');
      }
    }

    if (actual.correo_institucional === ADMIN_PRINCIPAL_EMAIL) {
      if (data.activo === false || (data.rol !== undefined && data.rol !== 'admin')) {
        throw new ValidationError('No se puede suspender ni modificar el rol del administrador principal del sistema');
      }
    }

    let password_hash: string | undefined;
    if (data.password !== undefined && data.password.trim() !== '') {
      if (data.password.length < 6) throw new ValidationError('La contraseña debe tener al menos 6 caracteres');
      password_hash = await bcrypt.hash(data.password, 10);
    }

    const user = await usersDAO.adminUpdate(id, {
      activo: data.activo,
      rol: data.rol,
      nombre_completo: data.nombre_completo,
      correo_institucional: data.correo_institucional,
      matricula_o_rfc: data.matricula_o_rfc,
      password_hash,
    });

    if (!user) throw new NotFoundError('Usuario no encontrado');
    return user;
  }

  static async adminCreate(data: { email: string; nombre_completo: string; password?: string; matricula_o_rfc?: string; rol?: string }) {
    if (!data.email || !data.nombre_completo) throw new ValidationError('El correo y el nombre completo son obligatorios');
    
    const rol = data.rol ?? 'estudiante';
    if (!['estudiante', 'admin'].includes(rol)) throw new ValidationError('El rol debe ser "estudiante" o "admin"');
    
    const correo = data.email.toLowerCase().trim();
    
    // ✅ VALIDACIÓN AGREGADA: Evita el "Error interno" y muestra mensaje claro
    if (!correo.endsWith('@upa.edu.mx') && !correo.endsWith('@alumnos.upa.edu.mx')) {
      throw new ValidationError('El correo debe ser institucional (@upa.edu.mx o @alumnos.upa.edu.mx)');
    }

    const existente = await usersDAO.findByEmail(correo);
    if (existente) throw new ValidationError('Ya existe una cuenta con este correo institucional');
    
    const pass = data.password || '123456';
    if (pass.length < 6) throw new ValidationError('La contraseña debe tener al menos 6 caracteres');
    
    const passwordHash = await bcrypt.hash(pass, 10);
    const matricula = data.matricula_o_rfc || correo.split('@')[0].toUpperCase();

    return usersDAO.adminCreate({
      email: correo,
      nombreCompleto: data.nombre_completo.trim(),
      passwordHash,
      rol,
      matricula_o_rfc: matricula
    });
  }

  static async adminGetUser(id: string) {
    const user = await usersDAO.findByIdForAdmin(id);
    if (!user) throw new NotFoundError('Usuario no encontrado');
    return user;
  }

  static async adminResetPassword(id: string) {
    const user = await usersDAO.findById(id);
    if (!user) throw new NotFoundError('Usuario no encontrado');
    await authService.forgotPassword(user.correo_institucional);
    return { message: `Código de restablecimiento generado y enviado a ${user.correo_institucional}` };
  }

  static async adminRemove(id: string) {
    const actual = await usersDAO.findByIdForAdmin(id);
    if (!actual) throw new NotFoundError('Usuario no encontrado');
    
    if (actual.correo_institucional === ADMIN_PRINCIPAL_EMAIL) {
      throw new ValidationError('No se puede eliminar al administrador principal del sistema');
    }
    
    const ok = await usersDAO.adminHardDelete(id);
    if (!ok) throw new NotFoundError('Usuario no encontrado');
    return true;
  }

  private static validar(data: UpdateUserProfileDTO): void {
    if (Object.keys(data).length === 0) throw new ValidationError('No se enviaron campos para actualizar');
    if (data.nombre_completo !== undefined) {
      const nombre = data.nombre_completo.trim();
      if (nombre.length < 3) throw new ValidationError('El nombre completo debe tener al menos 3 caracteres');
      if (nombre.length > 200) throw new ValidationError('El nombre completo no puede exceder 200 caracteres');
    }
    if (data.telefono !== undefined && data.telefono !== '' && !/^[\d+\-\s()]{7,20}$/.test(data.telefono)) {
      throw new ValidationError('El telefono no tiene un formato valido');
    }
    if (data.url_foto !== undefined && data.url_foto !== '' && !URL_REGEX.test(data.url_foto) && !data.url_foto.startsWith('data:image/')) {
      throw new ValidationError('La foto debe ser una URL válida o una imagen subida');
    }
    for (const campo of ['github_url', 'linkedin_url'] as const) {
      const valor = data[campo];
      if (valor !== undefined && valor !== '' && !URL_REGEX.test(valor)) {
        throw new ValidationError(`El campo ${campo} debe ser una URL valida (http/https)`);
      }
    }
    if (data.biografia !== undefined && data.biografia.length > 2000) {
      throw new ValidationError('La biografia no puede exceder 2000 caracteres');
    }
  }
}