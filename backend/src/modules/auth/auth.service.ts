import jwt from 'jsonwebtoken';
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
   * Verifica el OTP. Si es válido, retorna un JWT de sesión. Crea el usuario si no existe.
   */
  async verifyToken(email: string, token: string): Promise<string> {
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

    // Generar JWT
    return this.generarAccessToken(user);
  }

  /**
   * Inicia sesión con Google: verifica el ID token emitido por Google,
   * valida que el correo sea institucional y crea el usuario si no existe.
   */
  async loginWithGoogle(idToken: string): Promise<string> {
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

    return this.generarAccessToken(user);
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
        matricula: user.matricula_o_rfc
      },
      jwtSecret,
      { expiresIn: '24h' }
    );
  }
}

export const authService = new AuthService();
