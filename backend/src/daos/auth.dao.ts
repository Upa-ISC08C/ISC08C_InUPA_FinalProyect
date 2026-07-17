import { db } from '../config/db';

export interface User {
  id: string;
  matricula_o_rfc: string;
  nombre_completo: string;
  correo_institucional: string;
  password_hash: string;
  activo: boolean;
}

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
   * Crea un nuevo usuario en la base de datos a partir de su correo (primer login)
   */
  async createUserFromEmail(email: string): Promise<User> {
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
      `Usuario ${matricula}`, // Nombre por defecto temporal
      email,
      dummyHash
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }
}

export const authDAO = new AuthDAO();
