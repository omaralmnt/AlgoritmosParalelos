const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const sns = new SNSClient({ region: process.env.AWS_REGION });
const topicArn = process.env.SNS_TOPIC_ARN;

exports.handler = async (event) => {
  console.log('Request event:', JSON.stringify(event, null, 2));

  try {
    const body = event.body ? JSON.parse(event.body) : event;

    const { to, subject, message: emailBody, from } = body;

    if (!to || !subject || !emailBody) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Faltan parámetros requeridos: to, subject, message'
        })
      };
    }

    const emailData = {
      to,
      subject,
      body: emailBody,
      from: from || process.env.FROM_EMAIL
    };

    console.log(`Publicando email a SNS: to=${to}, subject="${subject}"`);

    const command = new PublishCommand({
      TopicArn: topicArn,
      Message: JSON.stringify(emailData),
      Subject: 'Email Request'
    });

    const response = await sns.send(command);

    console.log(`Mensaje publicado a SNS. MessageId: ${response.MessageId}`);

    return {
      statusCode: 202,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Email encolado para envío',
        messageId: response.MessageId,
        to: to,
        subject: subject
      })
    };

  } catch (error) {
    console.error('Error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Error procesando solicitud de email',
        details: error.message
      })
    };
  }
};
