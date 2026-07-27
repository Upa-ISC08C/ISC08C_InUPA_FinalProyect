import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Google muestra las contraseñas de aplicación en grupos de 4 ("abcd efgh ijkl mnop"),
// pero el SMTP las rechaza si se envían con los espacios. Los quitamos siempre.
const mailUser = (process.env.MAIL_USER || '').trim();
const mailPass = (process.env.MAIL_PASS || '').replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: mailUser,
    pass: mailPass,
  },
});

/** El correo es opcional: sin credenciales la app arranca igual. */
export const mailConfigurado = Boolean(mailUser && mailPass);

/**
 * Comprueba las credenciales SMTP al arrancar para que un fallo de autenticación
 * se vea en los logs y no se confunda con "el código no funciona".
 */
export async function verificarMailer(): Promise<boolean> {
  if (!mailConfigurado) {
    console.warn('[mailer] Sin MAIL_USER/MAIL_PASS: los códigos se imprimirán en consola y NO se enviarán correos.');
    return false;
  }
  try {
    await transporter.verify();
    console.log(`[mailer] SMTP listo (${mailUser}).`);
    return true;
  } catch (error: any) {
    console.error(`[mailer] SMTP NO autenticó: ${error.message?.split('\n')[0]}`);
    console.error('[mailer] Genera una nueva contraseña de aplicación en https://myaccount.google.com/apppasswords y actualiza MAIL_PASS.');
    return false;
  }
}

export const sendTokenEmail = async (to: string, token: string) => {
  if (!mailConfigurado) {
    console.warn(
      '[mailer] MAIL_USER/MAIL_PASS no configurados: no se envio el correo. ' +
        'Rellena esas variables en docker/.env para probar el login por OTP.'
    );
    // En desarrollo mostramos el codigo en consola para poder continuar sin correo.
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[mailer] (solo desarrollo) OTP para ${to}: ${token}`);
    }
    return false;
  }

  const mailOptions = {
    from: `"InUPA Support" <${mailUser}>`,
    to,
    subject: 'Tu código de acceso a InUPA',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Bienvenido a InUPA</h2>
        <p>Tu código de un solo uso (OTP) para iniciar sesión es:</p>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
          ${token}
        </div>
        <p style="color: #7f8c8d; font-size: 14px;">Este código expirará en 10 minutos. Si no solicitaste este código, puedes ignorar este correo.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/** Envoltorio genérico para enviar un correo HTML. Devuelve false si el mail no está configurado. */
async function sendHtmlEmail(to: string, subject: string, html: string, devLog?: string): Promise<boolean> {
  if (!mailConfigurado) {
    console.warn('[mailer] MAIL_USER/MAIL_PASS no configurados: no se envio el correo.');
    if (devLog && process.env.NODE_ENV !== 'production') console.warn(devLog);
    return false;
  }
  try {
    const info = await transporter.sendMail({ from: `"InUPA Support" <${mailUser}>`, to, subject, html });
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error: any) {
    console.error(`[mailer] No se pudo enviar a ${to}: ${error.message?.split('\n')[0]}`);
    // Si el envío falla en desarrollo seguimos mostrando el código en consola,
    // para poder completar el flujo mientras se arreglan las credenciales.
    if (devLog && process.env.NODE_ENV !== 'production') console.warn(devLog);
    return false;
  }
}

const shell = (titulo: string, cuerpo: string) => `
  <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eaeaec; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.04);">
    <div style="background-color: #003366; padding: 28px; text-align: center; border-bottom: 4px solid #FFD700;">
      <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">InUPA</h1>
      <p style="color: rgba(255, 215, 0, 0.8); margin: 6px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; font-weight: 600;">Plataforma Universitaria</p>
    </div>
    <div style="padding: 40px 32px;">
      <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0 0 16px;">${titulo}</h2>
      <div style="color: #4b5563; font-size: 15px; line-height: 1.6;">
        ${cuerpo}
      </div>
    </div>
    <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #f3f4f6;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0; font-weight: 500;">Universidad Politécnica de Aguascalientes</p>
      <p style="color: #9ca3af; font-size: 12px; margin: 6px 0 0;">Este es un correo automático, por favor no respondas.</p>
    </div>
  </div>`;

const codeBox = (code: string) => `
  <div style="background-color: #f4f5f7; border: 1px solid #e5e7eb; padding: 24px; text-align: center; border-radius: 10px; margin: 32px 0;">
    <div style="font-family: 'SF Mono', ui-monospace, Menlo, Monaco, Consolas, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #003366; margin-left: 10px;">
      ${code}
    </div>
  </div>`;

/** Correo para restablecer la contraseña (código de un solo uso). */
export const sendResetEmail = (to: string, code: string) =>
  sendHtmlEmail(
    to,
    'Restablece tu contraseña · InUPA',
    shell('Restablecer contraseña', `<p>Usa este código para restablecer tu contraseña:</p>${codeBox(code)}<p style="color:#7f8c8d;font-size:14px;">Expira en 15 minutos. Si no lo solicitaste, ignora este correo.</p>`),
    `[mailer] (solo desarrollo) Código de reset para ${to}: ${code}`
  );

/** Correo de verificación de cuenta (código de un solo uso). */
export const sendVerificationEmail = (to: string, code: string) =>
  sendHtmlEmail(
    to,
    'Verifica tu cuenta · InUPA',
    shell('Verifica tu correo', `<p>¡Bienvenido a InUPA! Confirma tu correo con este código:</p>${codeBox(code)}<p style="color:#7f8c8d;font-size:14px;">Expira en 24 horas.</p>`),
    `[mailer] (solo desarrollo) Código de verificación para ${to}: ${code}`
  );
