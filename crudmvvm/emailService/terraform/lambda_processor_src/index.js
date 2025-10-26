const nodemailer = require('nodemailer');

// Configurar transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.handler = async (event) => {
  console.log('Procesando mensajes de email:', JSON.stringify(event, null, 2));

  const results = [];

  for (const record of event.Records) {
    try {
      // Parsear el mensaje de SNS que viene en el body de SQS
      const snsMessage = JSON.parse(record.body);
      const emailData = JSON.parse(snsMessage.Message);

      const { to, subject, body, from } = emailData;

      console.log(`Preparando email para: ${to}, asunto: "${subject}"`);

      // Validaciones básicas
      if (!to || !subject || !body) {
        throw new Error('Faltan parámetros requeridos: to, subject, body');
      }

      // Configurar email
      const mailOptions = {
        from: from || process.env.FROM_EMAIL,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject: subject,
        text: body
      };

      // Enviar email con Nodemailer
      const info = await transporter.sendMail(mailOptions);

      console.log(`Correo enviado a ${to}. MessageId: ${info.messageId}`);

      results.push({
        messageId: record.messageId,
        to: to,
        status: 'success',
        emailMessageId: info.messageId
      });

    } catch (error) {
      console.error('Error procesando mensaje:', error);
      console.error('Mensaje completo:', JSON.stringify(record, null, 2));

      results.push({
        messageId: record.messageId,
        status: 'error',
        error: error.message
      });

      // Re-lanzar el error para que el mensaje vuelva a la cola o vaya a DLQ
      throw error;
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Procesamiento completado',
      results: results
    })
  };
};
