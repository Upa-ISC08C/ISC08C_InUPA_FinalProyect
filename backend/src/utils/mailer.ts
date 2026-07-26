import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/** El correo es opcional: sin credenciales la app arranca igual. */
export const mailConfigurado = Boolean(process.env.MAIL_USER && process.env.MAIL_PASS);

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
    from: `"InUPA Support" <${process.env.MAIL_USER}>`,
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
    const info = await transporter.sendMail({ from: `"InUPA Support" <${process.env.MAIL_USER}>`, to, subject, html });
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

const shell = (titulo: string, cuerpo: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2c3e50;">${titulo}</h2>
    ${cuerpo}
    <p style="color: #7f8c8d; font-size: 12px; margin-top: 24px;">InUPA · Universidad Politécnica de Aguascalientes</p>
  </div>`;

const codeBox = (code: string) => `
  <div style="background:#f8f9fa;padding:20px;text-align:center;font-size:24px;font-weight:bold;letter-spacing:5px;border-radius:5px;margin:20px 0;">${code}</div>`;

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
