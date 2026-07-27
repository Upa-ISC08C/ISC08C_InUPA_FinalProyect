import { db } from '../config/db';

export interface User {
  id: string;
  matricula_o_rfc: string;
  nombre_completo: string;
  correo_institucional: string;
  password_hash: string;
  rol: string;
  carrera: string | null;
  cuatrimestre: number | null;
  activo: boolean;
  email_verificado?: boolean;
}

/** Tipos de código de un solo uso que maneja la plataforma. */
export type CodeType = 'otp' | 'reset' | 'verify';

export class AuthDAO {
  /**
   * Busca un usuario por su correo institucional
   */
  async findUserByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM USUARIOS WHERE correo_institucional = $1 AND activo = true';
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Crea un usuario con contraseña (registro clasico usuario/contraseña).
   * El password ya debe venir hasheado (bcrypt).
   */
  async createUserWithPassword(data: {
    email: string;
    nombreCompleto: string;
    passwordHash: string;
    matricula?: string;
    carrera?: string;
    cuatrimestre?: number;
  }): Promise<User> {
    const matricula = (data.matricula || data.email.split('@')[0]).toUpperCase();
    const query = `
      INSERT INTO USUARIOS
        (matricula_o_rfc, nombre_completo, correo_institucional, password_hash, rol, carrera, cuatrimestre)
      VALUES ($1, $2, $3, $4, 'estudiante', $5, $6)
      RETURNING *
    `;
    const values = [
      matricula,
      data.nombreCompleto.trim(),
      data.email,
      data.passwordHash,
      data.carrera ?? null,
      data.cuatrimestre ?? null,
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Crea un nuevo usuario en la base de datos a partir de su correo (primer login)
   */
  async createUserFromEmail(email: string, nombreCompleto?: string): Promise<User> {
    // Extraer matrícula del correo (ej. up200000@alumnos.upa.edu.mx -> up200000)
    const matricula = email.split('@')[0].toUpperCase();
    
    const query = `
      INSERT INTO USUARIOS (matricula_o_rfc, nombre_completo, correo_institucional, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    // Como usamos OTP, el password_hash no es la vía principal de auth, 
    // pero guardamos un hash dummy por la restricción NOT NULL
    const dummyHash = 'OTP_LOGIN_NO_PASSWORD';
    
    const values = [
      matricula,
      nombreCompleto?.trim() || `Usuario ${matricula}`, // Nombre real (Google) o temporal
      email,
      dummyHash
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /** Actualiza el hash de contraseña de un usuario por su correo. */
  async updatePasswordByEmail(email: string, passwordHash: string): Promise<boolean> {
    const result = await db.query(
      'UPDATE USUARIOS SET password_hash = $1 WHERE correo_institucional = $2 AND activo = true',
      [passwordHash, email]
    );
    return (result.rowCount ?? 0) > 0;
  }

  /** Marca el correo de un usuario como verificado. */
  async setEmailVerified(email: string): Promise<boolean> {
    const result = await db.query(
      'UPDATE USUARIOS SET email_verificado = true WHERE correo_institucional = $1',
      [email]
    );
    return (result.rowCount ?? 0) > 0;
  }

  // --- Códigos de un solo uso (OTP / reset / verificación) -------------------
  // Se guardan en la BD para que un reinicio del backend no los invalide.

  /** Guarda (o reemplaza) el código vigente de un correo para un tipo dado. */
  async saveCode(email: string, tipo: CodeType, codigo: string, expiraEn: Date): Promise<void> {
    await db.query(
      `INSERT INTO AUTH_CODIGOS (correo, tipo, codigo, expira_en)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (correo, tipo)
       DO UPDATE SET codigo = EXCLUDED.codigo, expira_en = EXCLUDED.expira_en, creado_en = CURRENT_TIMESTAMP`,
      [email, tipo, codigo, expiraEn]
    );
  }

  /** Devuelve el código vigente de un correo, o null si no existe. */
  async getCode(email: string, tipo: CodeType): Promise<{ codigo: string; expira_en: Date } | null> {
    const result = await db.query(
      'SELECT codigo, expira_en FROM AUTH_CODIGOS WHERE correo = $1 AND tipo = $2',
      [email, tipo]
    );
    return result.rows[0] || null;
  }

  /** Elimina el código una vez usado (o expirado). */
  async deleteCode(email: string, tipo: CodeType): Promise<void> {
    await db.query('DELETE FROM AUTH_CODIGOS WHERE correo = $1 AND tipo = $2', [email, tipo]);
  }
}

export const authDAO = new AuthDAO();
