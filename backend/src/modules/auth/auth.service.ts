import jwt from 'jsonwebtoken';
import { sendTokenEmail } from '../../utils/mailer';
import { authDAO, User } from '../../daos/auth.dao';

// Almacén temporal en memoria para los OTPs. En producción usaríamos Redis.
interface OTPData {
  token: string;
  expires: number;
}
const otpStore = new Map<string, OTPData>();

export class AuthService {
  /**
   * Valida el formato del correo y genera/envía un OTP
   */
  async requestToken(email: string): Promise<boolean> {
    // Validar que sea un correo institucional
    if (!email.endsWith('@alumnos.upa.edu.mx') && !email.endsWith('@upa.edu.mx')) {
      throw new Error('El correo debe ser institucional (@alumnos.upa.edu.mx o @upa.edu.mx)');
    }

    // Generar OTP numérico de 6 dígitos
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Guardar OTP en memoria por 10 minutos
    otpStore.set(email, {
      token: otp,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutos
    });

    // Enviar correo
    const success = await sendTokenEmail(email, otp);
    return success;
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
    const jwtSecret = process.env.JWT_SECRET || 'secret';
    const accessToken = jwt.sign(
      { 
        id: user.id, 
        email: user.correo_institucional,
        matricula: user.matricula_o_rfc
      }, 
      jwtSecret, 
      { expiresIn: '24h' }
    );

    return accessToken;
  }
}

export const authService = new AuthService();
