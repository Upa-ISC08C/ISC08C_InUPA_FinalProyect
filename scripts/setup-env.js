#!/usr/bin/env node
/**
 * Prepara las variables de entorno del proyecto en CUALQUIER computadora.
 *
 *   node scripts/setup-env.js
 *
 * - Crea docker/.env a partir de docker/.env.example si no existe.
 * - Genera un JWT_SECRET aleatorio propio de esta maquina.
 * - Es idempotente: si docker/.env ya existe, NO lo sobrescribe
 *   (solo avisa si le faltan variables nuevas).
 *
 * Sin dependencias externas: solo Node.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RAIZ = path.resolve(__dirname, '..');
const EJEMPLO = path.join(RAIZ, 'docker', '.env.example');
const DESTINO = path.join(RAIZ, 'docker', '.env');

/** Lee un archivo .env como pares clave/valor (ignora comentarios y vacias). */
function leerEnv(ruta) {
  if (!fs.existsSync(ruta)) return {};
  const vars = {};
  for (const linea of fs.readFileSync(ruta, 'utf8').split(/\r?\n/)) {
    const m = linea.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/);
    if (m) vars[m[1]] = m[2].trim();
  }
  return vars;
}

function generarSecreto() {
  return crypto.randomBytes(32).toString('hex'); // 64 caracteres
}

function main() {
  if (!fs.existsSync(EJEMPLO)) {
    console.error(`ERROR: no se encontro ${EJEMPLO}`);
    process.exit(1);
  }

  // Caso 1: ya existe -> no tocar, solo revisar que no falten variables
  if (fs.existsSync(DESTINO)) {
    const actuales = leerEnv(DESTINO);
    const esperadas = Object.keys(leerEnv(EJEMPLO));
    const faltantes = esperadas.filter((k) => !(k in actuales));

    console.log('docker/.env ya existe: no se sobrescribe.');
    if (faltantes.length > 0) {
      console.log('\n  Faltan variables nuevas que si estan en .env.example:');
      faltantes.forEach((k) => console.log(`   - ${k}`));
      console.log('\n  Agregalas a mano a docker/.env (o borra el archivo y vuelve a correr este script).');
    } else {
      console.log('Todas las variables estan presentes. Nada que hacer.');
    }
    return;
  }

  // Caso 2: no existe -> crearlo con un JWT_SECRET aleatorio
  const contenido = fs
    .readFileSync(EJEMPLO, 'utf8')
    .replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${generarSecreto()}`);

  fs.writeFileSync(DESTINO, contenido, 'utf8');

  console.log('Listo: se creo docker/.env con un JWT_SECRET aleatorio.');
  console.log('');
  console.log('Ya puedes levantar el proyecto:');
  console.log('   docker compose -f docker/docker-compose.yml up -d');
  console.log('');
  console.log('Opcional: si vas a probar el login por correo (OTP), rellena');
  console.log('MAIL_USER y MAIL_PASS en docker/.env (App Password de Gmail).');
}

main();
