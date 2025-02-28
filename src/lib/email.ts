import nodemailer from 'nodemailer';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

// Configuración del transporte de correo
const getEmailTransporter = () => {
  // En producción, usar variables de entorno para configurar el servicio de email
  if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: process.env.EMAIL_SERVER_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
  }

  // En desarrollo, usar Ethereal para pruebas
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_EMAIL || 'ethereal.user@ethereal.email',
      pass: process.env.ETHEREAL_PASSWORD || 'ethereal_pass',
    },
  });
};

export const sendEmail = async ({ to, subject, html }: EmailPayload) => {
  const transporter = getEmailTransporter();
  const from = process.env.EMAIL_FROM || 'noreply@coparentalidad.app';

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    // En desarrollo, mostrar la URL de previsualización de Ethereal
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📧 Email enviado: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw new Error('Error al enviar email');
  }
}; 