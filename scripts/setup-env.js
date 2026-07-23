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
const DESTINO_RAIZ = path.join(RAIZ, '.env');
const DESTINO_BACKEND = path.join(RAIZ, 'backend', '.env');

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

  const raizExiste = fs.existsSync(DESTINO_RAIZ);
  const backendExiste = fs.existsSync(DESTINO_BACKEND);

  // Caso 1: ya existen ambos -> revisar que no falten variables
  if (raizExiste && backendExiste) {
    const actuales = leerEnv(DESTINO_RAIZ);
    const esperadas = Object.keys(leerEnv(EJEMPLO));
    const faltantes = esperadas.filter((k) => !(k in actuales));

    console.log('.env ya existe en la raiz y en backend: no se sobrescribe.');
    if (faltantes.length > 0) {
      console.log('\n  Faltan variables nuevas que si estan en .env.example:');
      faltantes.forEach((k) => console.log(`   - ${k}`));
      console.log('\n  Agregalas a mano a tus archivos .env.');
    } else {
      console.log('Todas las variables estan presentes. Nada que hacer.');
    }
    return;
  }

  // Caso 2: generar contenido nuevo con JWT_SECRET aleatorio
  const contenido = fs
    .readFileSync(EJEMPLO, 'utf8')
    .replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${generarSecreto()}`);

  if (!raizExiste) {
    fs.writeFileSync(DESTINO_RAIZ, contenido, 'utf8');
    console.log('Listo: se creo .env en la raiz.');
  }

  if (!backendExiste) {
    fs.writeFileSync(DESTINO_BACKEND, contenido, 'utf8');
    console.log('Listo: se creo backend/.env (necesario para Prisma y ejecucion manual).');
  }

  console.log('');
  console.log('Ya puedes levantar el proyecto:');
  console.log('   docker compose -f docker/docker-compose.yml up -d');
  console.log('');
  console.log('Opcional: si vas a probar el login por correo (OTP), rellena');
  console.log('MAIL_USER y MAIL_PASS en tus archivos .env.');
}

main();
