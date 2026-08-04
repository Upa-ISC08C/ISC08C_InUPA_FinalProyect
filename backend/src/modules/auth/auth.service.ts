import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { sendTokenEmail, sendResetEmail, sendVerificationEmail, mailConfigurado } from '../../utils/mailer';
import { authDAO, User, CodeType } from '../../daos/auth.dao';
import { ValidationError } from '../../shared/errors';

/** Genera un código numérico de 6 dígitos. */
const generarCodigo = () => Math.floor(100000 + Math.random() * 900000).toString();

// Cliente para verificar los ID token que emite Google
const googleClient = new OAuth2Client();

/** Datos publicos del usuario que se envian al frontend (sin password_hash). */
export interface PublicUser {
  id: string;
  matricula_o_rfc: string;
  nombre_completo: string;
  correo_institucional: string;
  rol: string;
  carrera: string | null;
  cuatrimestre: number | null;
}

/** Resultado de un login exitoso: token de sesion + datos del usuario. */
export interface AuthResult {
  token: string;
  user: PublicUser;
}

export class AuthService {
  /**
   * Valida el formato del correo y genera/envía un OTP
   */
  async requestToken(email: string): Promise<boolean> {
    // Validar que sea un correo institucional
    this.validarCorreoInstitucional(email);

    // Generar OTP numérico de 6 dígitos
    const otp = generarCodigo();

    // Guardar el OTP en la BD por 10 minutos (sobrevive a reinicios del backend).
    await authDAO.saveCode(email.toLowerCase().trim(), 'otp', otp, new Date(Date.now() + 10 * 60 * 1000));

    // Enviar correo
    const enviado = await sendTokenEmail(email, otp);

    // Si el correo NO esta configurado (caso tipico al clonar el repo), en
    // desarrollo damos la operacion por buena: el OTP queda impreso en los logs
    // del backend para poder completar el login sin credenciales de correo.
    if (!enviado && !mailConfigurado && process.env.NODE_ENV !== 'production') {
      return true;
    }

    return enviado;
  }

  /**
   * Registro clásico: crea un usuario con correo institucional y contraseña.
   * Devuelve el JWT de sesión + los datos del usuario (auto-login).
   */
  async register(data: {
    nombre: string;
    email: string;
    password: string;
    matricula?: string;
    carrera?: string;
    cuatrimestre?: number;
  }): Promise<AuthResult> {
    const correo = data.email.toLowerCase().trim();

    if (!data.nombre || data.nombre.trim().length < 3) {
      throw new ValidationError('El nombre completo debe tener al menos 3 caracteres');
    }
    this.validarCorreoInstitucional(correo);
    if (!data.password || data.password.length < 6) {
      throw new ValidationError('La contraseña debe tener al menos 6 caracteres');
    }

    // sin filtrar por activo, para distinguir cuenta suspendida de correo ya en uso
    const existente = await authDAO.findUserByEmailAny(correo);
    if (existente) {
      if (!existente.activo) {
        throw new ValidationError('Esta cuenta fue suspendida. Contacta a un administrador para reactivarla.');
      }
      throw new ValidationError('Ya existe una cuenta con este correo institucional');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await authDAO.createUserWithPassword({
      email: correo,
      nombreCompleto: data.nombre.trim(),
      passwordHash,
      matricula: data.matricula,
      carrera: data.carrera,
      cuatrimestre: data.cuatrimestre,
    });

    // Enviamos el correo de verificación (no bloquea el registro/auto-login).
    void this.enviarVerificacion(correo);

    return {
      token: this.generarAccessToken(user),
      user: this.toPublicUser(user),
    };
  }

  /**
   * Genera y envía un código de restablecimiento de contraseña.
   * Por seguridad devuelve siempre true (no revela si el correo existe).
   */
  async forgotPassword(email: string): Promise<boolean> {
    const correo = email.toLowerCase().trim();
    const user = await authDAO.findUserByEmail(correo);
    if (!user) return true; // No revelamos si el correo existe (ni si está suspendida).

    const codigo = generarCodigo();
    await authDAO.saveCode(correo, 'reset', codigo, new Date(Date.now() + 15 * 60 * 1000));
    return sendResetEmail(correo, codigo);
  }

  /**
   * Comprueba que el código guardado coincida y siga vigente.
   * Centraliza la validación para que reset y verificación se comporten igual.
   */
  private async validarCodigo(correo: string, tipo: CodeType, token: string, faltante: string): Promise<void> {
    const data = await authDAO.getCode(correo, tipo);
    if (!data) throw new ValidationError(faltante);
    if (Date.now() > new Date(data.expira_en).getTime()) {
      await authDAO.deleteCode(correo, tipo);
      throw new ValidationError('El código ha expirado. Solicita uno nuevo.');
    }
    if (data.codigo !== String(token).trim()) {
      // solo el codigo mas reciente es valido: un admin pudo haber generado otro despues
      const mensaje = tipo === 'reset'
        ? 'Este código ya no es válido: es posible que se haya generado uno más reciente (por ti o por un administrador). Revisa el correo más reciente que recibiste e intenta de nuevo.'
        : 'Código inválido';
      throw new ValidationError(mensaje);
    }
  }

  /** Verifica si el código de restablecimiento es válido sin cambiar la contraseña aún. */
  async verifyResetToken(email: string, token: string): Promise<boolean> {
    const correo = email.toLowerCase().trim();
    await this.validarCodigo(correo, 'reset', token, 'No hay una solicitud de restablecimiento activa para este correo');
    return true;
  }

  /** Verifica el código y actualiza la contraseña. */
  async resetPassword(email: string, token: string, nuevaPassword: string): Promise<void> {
    const correo = email.toLowerCase().trim();
    await this.validarCodigo(correo, 'reset', token, 'No hay una solicitud de restablecimiento activa para este correo');
    if (!nuevaPassword || nuevaPassword.length < 6) throw new ValidationError('La contraseña debe tener al menos 6 caracteres');

    const passwordHash = await bcrypt.hash(nuevaPassword, 10);
    const actualizada = await authDAO.updatePasswordByEmail(correo, passwordHash);
    if (!actualizada) throw new ValidationError('No se pudo actualizar la contraseña. La cuenta no existe o está suspendida.');
    await authDAO.deleteCode(correo, 'reset');
  }

  /** Genera y envía un código de verificación de correo. */
  async enviarVerificacion(email: string): Promise<boolean> {
    const correo = email.toLowerCase().trim();
    const codigo = generarCodigo();
    await authDAO.saveCode(correo, 'verify', codigo, new Date(Date.now() + 24 * 60 * 60 * 1000));
    return sendVerificationEmail(correo, codigo);
  }

  /** Confirma el código de verificación y marca el correo como verificado. */
  async verifyEmail(email: string, token: string): Promise<void> {
    const correo = email.toLowerCase().trim();
    await this.validarCodigo(correo, 'verify', token, 'No hay una verificación activa para este correo');
    await authDAO.setEmailVerified(correo);
    await authDAO.deleteCode(correo, 'verify');
  }

  /**
   * Inicio de sesión clásico con correo institucional + contraseña.
   */
  async loginWithPassword(email: string, password: string): Promise<AuthResult> {
    const correo = email.toLowerCase().trim();

    if (!correo || !password) {
      throw new ValidationError('Correo y contraseña son requeridos');
    }

    // findUserByEmailAny (sin filtrar por activo): así podemos avisar
    // claramente que la cuenta fue suspendida en vez de un genérico
    // "correo o contraseña incorrectos" que confunde al usuario suspendido.
    const user = await authDAO.findUserByEmailAny(correo);
    const credencialesInvalidas = () => new ValidationError('Correo o contraseña incorrectos');

    if (!user) {
      throw credencialesInvalidas();
    }

    const coincide = await bcrypt.compare(password, user.password_hash);
    if (!coincide) {
      throw credencialesInvalidas();
    }

    if (!user.activo) {
      throw new ValidationError('Tu cuenta ha sido suspendida. Contacta a un administrador.');
    }

    return {
      token: this.generarAccessToken(user),
      user: this.toPublicUser(user),
    };
  }

  /**
   * Verifica el OTP. Si es válido, retorna el JWT de sesión y los datos del
   * usuario. Crea el usuario si no existe.
   */
  async verifyToken(email: string, token: string): Promise<AuthResult> {
    const correo = email.toLowerCase().trim();
    await this.validarCodigo(correo, 'otp', token, 'No se encontró un código OTP activo para este correo');

    // Token correcto, se consume para que no pueda reutilizarse.
    await authDAO.deleteCode(correo, 'otp');

    // Buscar si el usuario existe o crearlo
    let user = await authDAO.findUserByEmail(email);
    if (!user) {
      user = await authDAO.createUserFromEmail(email);
    }

    // Generar JWT + datos del usuario
    return {
      token: this.generarAccessToken(user),
      user: this.toPublicUser(user),
    };
  }

  /**
   * Inicia sesión con Google: verifica el ID token emitido por Google,
   * valida que el correo sea institucional y crea el usuario si no existe.
   */
  async loginWithGoogle(idToken: string): Promise<AuthResult> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new ValidationError('GOOGLE_CLIENT_ID no está configurado en las variables de entorno');
    }

    const ticket = await googleClient.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();

    if (!payload?.email) {
      throw new ValidationError('No se pudo obtener el correo de la cuenta de Google');
    }
    if (!payload.email_verified) {
      throw new ValidationError('El correo de Google no está verificado');
    }

    const email = payload.email.toLowerCase();
    this.validarCorreoInstitucional(email);

    // Buscar si el usuario existe (incluida cuenta suspendida) o crearlo.
    let user = await authDAO.findUserByEmailAny(email);
    if (!user) {
      user = await authDAO.createUserFromEmail(email, payload.name);
    } else if (!user.activo) {
      throw new ValidationError('Tu cuenta ha sido suspendida. Contacta a un administrador.');
    }

    return {
      token: this.generarAccessToken(user),
      user: this.toPublicUser(user),
    };
  }

  /**
   * Valida que el correo pertenezca al dominio institucional de la UPA
   */
  private validarCorreoInstitucional(email: string): void {
    if (!email.endsWith('@alumnos.upa.edu.mx') && !email.endsWith('@upa.edu.mx')) {
      throw new ValidationError('El correo debe ser institucional (@alumnos.upa.edu.mx o @upa.edu.mx)');
    }
  }

  /**
   * Firma el JWT de sesión de la aplicación
   */
  private generarAccessToken(user: User): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET no está configurado en las variables de entorno');
    }
    return jwt.sign(
      {
        id: user.id,
        email: user.correo_institucional,
        matricula: user.matricula_o_rfc,
        rol: user.rol
      },
      jwtSecret,
      { expiresIn: '24h' }
    );
  }

  /**
   * Devuelve los datos publicos del usuario (sin password_hash) para el frontend.
   */
  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      matricula_o_rfc: user.matricula_o_rfc,
      nombre_completo: user.nombre_completo,
      correo_institucional: user.correo_institucional,
      rol: user.rol,
      carrera: user.carrera ?? null,
      cuatrimestre: user.cuatrimestre ?? null,
    };
  }
}

export const authService = new AuthService();
