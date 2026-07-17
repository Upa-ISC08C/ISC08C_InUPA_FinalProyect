import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'inupa_admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'inupadb',
  password: process.env.DB_PASSWORD || 'secretpassword',
  port: parseInt(process.env.DB_PORT || '5432'),
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  pool,
};
