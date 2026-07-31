/**
 * Aplica docker/init.sql a la base de datos configurada.
 *
 * El contenedor local de PostgreSQL ejecuta init.sql solo, porque Docker corre
 * lo que haya en /docker-entrypoint-initdb.d la primera vez. Una base
 * administrada (Azure Database for PostgreSQL, por ejemplo) no tiene ese
 * mecanismo: el esquema hay que aplicarlo a mano, y para eso es este script.
 *
 *   node scripts/aplicar-esquema.js
 *
 * Toma la conexion de las variables DB_* del entorno (incluida DB_SSL=true,
 * necesaria en Azure). CUIDADO: init.sql empieza con DROP TABLE, asi que borra
 * los datos existentes. Por eso pide confirmacion salvo que se pase --si.
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Pool } = require('pg');

const RUTA_SQL = path.resolve(__dirname, '../../docker/init.sql');

async function confirmar(pregunta) {
  if (process.argv.includes('--si')) return true;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const respuesta = await new Promise((r) => rl.question(pregunta, r));
  rl.close();
  return respuesta.trim().toLowerCase() === 'si';
}

async function main() {
  if (!fs.existsSync(RUTA_SQL)) {
    console.error(`No se encontro ${RUTA_SQL}`);
    process.exit(1);
  }

  const destino = `${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`;
  console.log('-'.repeat(62));
  console.log(' APLICAR ESQUEMA A LA BASE DE DATOS');
  console.log('-'.repeat(62));
  console.log(`  Destino: ${destino}`);
  console.log(`  SSL:     ${process.env.DB_SSL === 'true' ? 'si' : 'no'}`);
  console.log(`  Archivo: ${RUTA_SQL}`);
  console.log('');
  console.log('  ATENCION: init.sql empieza con DROP TABLE. Se perderan los');
  console.log('  datos que ya existan en esa base.');
  console.log('-'.repeat(62));

  if (!(await confirmar('  Escribe "si" para continuar: '))) {
    console.log('  Cancelado. No se toco la base de datos.');
    return;
  }

  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  try {
    const sql = fs.readFileSync(RUTA_SQL, 'utf8');
    await pool.query(sql);
    const { rows } = await pool.query(
      "SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log(`\n  Esquema aplicado. Tablas creadas: ${rows[0].n}`);
  } catch (error) {
    console.error(`\n  FALLO: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
