import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { sendTokenEmail, mailConfigurado } from '../../utils/mailer';
import { authDAO, User } from '../../daos/auth.dao';

// Almacén temporal en memoria para los OTPs. En producción usaríamos Redis.
interface OTPData {
  token: string;
  expires: number;
}
const otpStore = new Map<string, OTPData>();

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
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Guardar OTP en memoria por 10 minutos
    otpStore.set(email, {
      token: otp,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutos
    });

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
      throw new Error('El nombre completo debe tener al menos 3 caracteres');
    }
    this.validarCorreoInstitucional(correo);
    if (!data.password || data.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    const existente = await authDAO.findUserByEmail(correo);
    if (existente) {
      throw new Error('Ya existe una cuenta con este correo institucional');
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

    return {
      token: this.generarAccessToken(user),
      user: this.toPublicUser(user),
    };
  }

  /**
   * Inicio de sesión clásico con correo institucional + contraseña.
   */
  async loginWithPassword(email: string, password: string): Promise<AuthResult> {
    const correo = email.toLowerCase().trim();

    if (!correo || !password) {
      throw new Error('Correo y contraseña son requeridos');
    }

    const user = await authDAO.findUserByEmail(correo);
    // Mensaje genérico para no revelar si el correo existe.
    const credencialesInvalidas = new Error('Correo o contraseña incorrectos');

    if (!user) {
      throw credencialesInvalidas;
    }

    const coincide = await bcrypt.compare(password, user.password_hash);
    if (!coincide) {
      throw credencialesInvalidas;
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
    const otpData = otpStore.get(email);

    if (!otpData) {
      throw new Error('No se encontró un código OTP activo para este correo');
    }

    if (Date.now() > otpData.expires) {
      otpStore.delete(email);
      throw new Error('El código OTP ha expirado');
    }

    if (otpData.token !== token) {
      throw new Error('Código OTP inválido');
    }

    // Token correcto, se elimina del store
    otpStore.delete(email);

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
      throw new Error('GOOGLE_CLIENT_ID no está configurado en las variables de entorno');
    }

    const ticket = await googleClient.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();

    if (!payload?.email) {
      throw new Error('No se pudo obtener el correo de la cuenta de Google');
    }
    if (!payload.email_verified) {
      throw new Error('El correo de Google no está verificado');
    }

    const email = payload.email.toLowerCase();
    this.validarCorreoInstitucional(email);

    // Buscar si el usuario existe o crearlo (usando el nombre real de Google)
    let user = await authDAO.findUserByEmail(email);
    if (!user) {
      user = await authDAO.createUserFromEmail(email, payload.name);
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
      throw new Error('El correo debe ser institucional (@alumnos.upa.edu.mx o @upa.edu.mx)');
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
