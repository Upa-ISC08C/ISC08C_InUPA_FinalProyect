/**
 * Comprueba la configuracion de correo y manda un mensaje de prueba REAL.
 *
 *   docker compose -f docker/docker-compose.yml exec backend node scripts/probar-correo.js tu-correo@gmail.com
 *
 * Lee las variables MAIL_* del entorno (las del .env de la raiz), dice con
 * claridad si el servidor acepta las credenciales y, si le pasas un destino,
 * envia un correo de prueba para confirmar la entrega de punta a punta.
 */
const nodemailer = require('nodemailer');

const host = (process.env.MAIL_HOST || 'smtp.gmail.com').trim();
const port = parseInt(process.env.MAIL_PORT || '587');
const user = (process.env.MAIL_USER || '').trim();
// Google muestra la contrasena de aplicacion en grupos de 4; el SMTP la rechaza
// con espacios, asi que se quitan igual que en el mailer de la app.
const pass = (process.env.MAIL_PASS || '').replace(/\s+/g, '');
const sinAuth = process.env.MAIL_SIN_AUTH === 'true';
const destino = process.argv[2];

const linea = '-'.repeat(60);

async function main() {
  console.log(linea);
  console.log(' DIAGNOSTICO DE CORREO — InUPA');
  console.log(linea);
  console.log(`  Servidor:   ${host}:${port}`);
  console.log(`  Modo:       ${sinAuth ? 'sin autenticacion (servidor local)' : 'con usuario y contrasena'}`);
  if (!sinAuth) {
    console.log(`  Usuario:    ${user || '(vacio)'}`);
    console.log(`  Contrasena: ${pass ? `${pass.length} caracteres` : '(vacia)'}`);
    if (pass && pass.length !== 16 && host.includes('gmail')) {
      console.log('  AVISO: una App Password de Gmail tiene 16 caracteres.');
    }
  }
  console.log(linea);

  if (!sinAuth && (!user || !pass)) {
    console.log(' FALTA CONFIGURAR: define MAIL_USER y MAIL_PASS en el .env de la raiz.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    ...(sinAuth ? { ignoreTLS: true, tls: { rejectUnauthorized: false } } : { auth: { user, pass } }),
  });

  try {
    await transporter.verify();
    console.log(' [1/2] El servidor ACEPTA la configuracion.');
  } catch (error) {
    console.log(` [1/2] EL SERVIDOR RECHAZA LA CONFIGURACION:`);
    console.log(`       ${error.message.split('\n')[0]}`);
    if (/535|BadCredentials|Invalid login/i.test(error.message)) {
      console.log('');
      console.log('       Gmail rechaza usuario o contrasena. Revisa que:');
      console.log('       - la cuenta tenga la verificacion en 2 pasos ACTIVADA');
      console.log('       - la App Password se haya generado en ESA misma cuenta');
      console.log('       - MAIL_USER sea el correo completo de esa cuenta');
      console.log('       Generala en https://myaccount.google.com/apppasswords');
    }
    process.exit(1);
  }

  if (!destino) {
    console.log(' [2/2] Sin destinatario: no se envio nada.');
    console.log('       Vuelve a ejecutarlo con un correo para probar la entrega real:');
    console.log('       ... node scripts/probar-correo.js tu-correo@gmail.com');
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"InUPA" <${(process.env.MAIL_FROM || user || 'no-reply@inupa.local').trim()}>`,
      to: destino,
      subject: 'Prueba de correo · InUPA',
      html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
        <h2 style="color:#003366;">El correo de InUPA funciona</h2>
        <p>Si estas leyendo esto, la plataforma ya puede enviar correos a bandejas reales:
        codigos para iniciar sesion, restablecer la contrasena y avisos de vacantes nuevas.</p>
        <p style="color:#7f8c8d;font-size:13px;">Enviado desde ${host}:${port}</p>
      </div>`,
    });
    console.log(` [2/2] CORREO ENVIADO a ${destino}`);
    console.log(`       id: ${info.messageId}`);
    console.log('');
    console.log(' Revisa la bandeja (y la carpeta de spam).');
  } catch (error) {
    console.log(` [2/2] NO SE PUDO ENVIAR: ${error.message.split('\n')[0]}`);
    process.exit(1);
  }
}

main();
