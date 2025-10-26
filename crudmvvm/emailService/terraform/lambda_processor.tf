# CloudWatch Log Group para Lambda Email Processor
resource "aws_cloudwatch_log_group" "lambda_email_processor" {
  name              = "/aws/lambda/${var.project_name}-email-processor"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-email-processor-logs"
  }
}

# Código de la Lambda para procesar emails desde SQS
resource "null_resource" "email_processor_dependencies" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    command = <<EOT
      cd ${path.module}
      mkdir -p lambda_processor_src
      cat > lambda_processor_src/index.js << 'EOF'
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

      console.log(`Preparando email para: $${to}, asunto: "$${subject}"`);

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

      console.log(`Correo enviado a $${to}. MessageId: $${info.messageId}`);

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
EOF
      cat > lambda_processor_src/package.json << 'EOF'
{
  "dependencies": {
    "nodemailer": "^6.9.0"
  }
}
EOF
      cd lambda_processor_src
      npm install --production
    EOT
  }
}

data "archive_file" "email_processor_zip" {
  type        = "zip"
  source_dir  = "${path.module}/lambda_processor_src"
  output_path = "${path.module}/email_processor.zip"

  depends_on = [null_resource.email_processor_dependencies]
}

# Lambda Function para procesar emails desde SQS
resource "aws_lambda_function" "email_processor" {
  function_name = "${var.project_name}-email-processor"
  role          = aws_iam_role.email_processor_role.arn

  filename         = data.archive_file.email_processor_zip.output_path
  source_code_hash = data.archive_file.email_processor_zip.output_base64sha256

  handler     = "index.handler"
  runtime     = "nodejs20.x"
  timeout     = 60
  memory_size = 256

  environment {
    variables = {
      FROM_EMAIL = var.from_email
      SMTP_HOST  = var.smtp_host
      SMTP_PORT  = var.smtp_port
      SMTP_USER  = var.smtp_user
      SMTP_PASS  = var.smtp_pass
    }
  }

  # AWS_REGION está disponible automáticamente en Lambda, no es necesario definirla

  tags = {
    Name = "${var.project_name}-email-processor"
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda_email_processor,
    aws_iam_role_policy_attachment.email_processor_basic,
    aws_iam_role_policy.email_processor_sqs
  ]
}

# Event Source Mapping: SQS → Lambda
resource "aws_lambda_event_source_mapping" "email_queue_trigger" {
  event_source_arn = aws_sqs_queue.email_queue.arn
  function_name    = aws_lambda_function.email_processor.arn
  batch_size       = 10
  enabled          = true

  # Configuración para manejo de errores
  maximum_batching_window_in_seconds = 0
  function_response_types            = ["ReportBatchItemFailures"]
}
