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

export const sendTokenEmail = async (to: string, token: string) => {
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
