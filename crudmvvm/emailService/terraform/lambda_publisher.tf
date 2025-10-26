# CloudWatch Log Group para Lambda Email Publisher
resource "aws_cloudwatch_log_group" "lambda_email_publisher" {
  name              = "/aws/lambda/${var.project_name}-email-publisher"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-email-publisher-logs"
  }
}

# Lambda Publisher para enviar mensajes a SNS desde API Gateway
# Usar Lambda Layer para AWS SDK v3
resource "null_resource" "email_publisher_dependencies" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    command = <<EOT
      cd ${path.module}
      mkdir -p lambda_publisher_src
      cat > lambda_publisher_src/index.js << 'EOF'
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const sns = new SNSClient({ region: process.env.AWS_REGION });
const topicArn = process.env.SNS_TOPIC_ARN;

exports.handler = async (event) => {
  console.log('Request event:', JSON.stringify(event, null, 2));

  try {
    // Parsear el body del request
    const body = event.body ? JSON.parse(event.body) : event;

    const { to, subject, message: emailBody, from } = body;

    // Validaciones
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

    // Preparar mensaje para SNS
    const emailData = {
      to,
      subject,
      body: emailBody,
      from: from || process.env.FROM_EMAIL
    };

    console.log(`Publicando email a SNS: to=$${to}, subject="$${subject}"`);

    // Publicar mensaje a SNS
    const command = new PublishCommand({
      TopicArn: topicArn,
      Message: JSON.stringify(emailData),
      Subject: 'Email Request'
    });

    const response = await sns.send(command);

    console.log(`Mensaje publicado a SNS. MessageId: $${response.MessageId}`);

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
EOF
      cat > lambda_publisher_src/package.json << 'EOF'
{
  "dependencies": {
    "@aws-sdk/client-sns": "^3.0.0"
  }
}
EOF
      cd lambda_publisher_src
      npm install --production
    EOT
  }
}

data "archive_file" "email_publisher_zip" {
  type        = "zip"
  source_dir  = "${path.module}/lambda_publisher_src"
  output_path = "${path.module}/email_publisher.zip"

  depends_on = [null_resource.email_publisher_dependencies]
}

# Lambda Email Publisher
resource "aws_lambda_function" "email_publisher" {
  function_name = "${var.project_name}-email-publisher"
  role          = aws_iam_role.email_publisher_role.arn

  filename         = data.archive_file.email_publisher_zip.output_path
  source_code_hash = data.archive_file.email_publisher_zip.output_base64sha256

  handler     = "index.handler"
  runtime     = "nodejs20.x"
  timeout     = 10
  memory_size = 256

  environment {
    variables = {
      SNS_TOPIC_ARN = aws_sns_topic.email_topic.arn
      FROM_EMAIL    = var.from_email
    }
  }

  tags = {
    Name = "${var.project_name}-email-publisher"
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda_email_publisher,
    aws_iam_role_policy_attachment.email_publisher_basic,
    aws_iam_role_policy.email_publisher_sns
  ]
}
