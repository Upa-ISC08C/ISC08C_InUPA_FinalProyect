import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Los servicios administrados (Azure Database for PostgreSQL, entre otros)
// rechazan las conexiones sin TLS. En local el contenedor de Postgres no lo
// ofrece, asi que se activa solo cuando DB_SSL=true.
//
// rejectUnauthorized queda en false a proposito: Azure presenta un certificado
// de una CA que la imagen de Node no trae, y sin esto la conexion falla con
// "self signed certificate in certificate chain". El trafico viaja cifrado igual.
const usarSSL = process.env.DB_SSL === 'true';

const pool = new Pool({
  user: process.env.DB_USER || 'inupa_admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'inupadb',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ...(usarSSL ? { ssl: { rejectUnauthorized: false } } : {}),
});

// Un corte de red con la base no debe tumbar el proceso entero.
pool.on('error', (err) => {
  console.error('[db] Error inesperado en el pool de conexiones:', err.message);
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  pool,
};
