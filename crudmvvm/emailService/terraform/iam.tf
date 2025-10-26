# ============================================================================
# IAM ROLES Y POLICIES PARA EMAIL PROCESSOR
# ============================================================================

# IAM Role para Email Processor Lambda
resource "aws_iam_role" "email_processor_role" {
  name = "${var.project_name}-processor-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-processor-role"
  }
}

# Policy para logs de CloudWatch
resource "aws_iam_role_policy_attachment" "email_processor_basic" {
  role       = aws_iam_role.email_processor_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Policy para recibir mensajes de SQS
resource "aws_iam_role_policy" "email_processor_sqs" {
  name = "${var.project_name}-processor-sqs-policy"
  role = aws_iam_role.email_processor_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:ChangeMessageVisibility"
        ]
        Resource = aws_sqs_queue.email_queue.arn
      }
    ]
  })
}

# NOTA: No se necesitan permisos adicionales para SMTP
# La Lambda usa Nodemailer con credenciales SMTP (Gmail, Outlook, etc.)
# Solo necesita permisos básicos de CloudWatch (ya configurados arriba)

# ============================================================================
# IAM ROLES Y POLICIES PARA EMAIL PUBLISHER
# ============================================================================

# IAM Role para Email Publisher Lambda
resource "aws_iam_role" "email_publisher_role" {
  name = "${var.project_name}-publisher-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-publisher-role"
  }
}

# Policy para logs
resource "aws_iam_role_policy_attachment" "email_publisher_basic" {
  role       = aws_iam_role.email_publisher_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Policy para publicar a SNS
resource "aws_iam_role_policy" "email_publisher_sns" {
  name = "${var.project_name}-publisher-sns-policy"
  role = aws_iam_role.email_publisher_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = aws_sns_topic.email_topic.arn
      }
    ]
  })
}
