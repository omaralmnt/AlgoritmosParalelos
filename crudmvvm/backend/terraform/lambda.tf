# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "lambda_api" {
  name              = "/aws/lambda/${var.project_name}-api"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-api-logs"
  }
}

resource "aws_cloudwatch_log_group" "lambda_console" {
  name              = "/aws/lambda/${var.project_name}-console"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-console-logs"
  }
}

# Empaquetar la aplicación
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../"
  output_path = "${path.module}/lambda_function.zip"

  excludes = [
    "terraform",
    "terraform/*",
    "node_modules",
    "tests",
    "var/cache/*",
    "var/log/*",
    ".git",
    ".env",
    ".env.local",
    ".env.test"
  ]
}

# Lambda Layers de Bref para PHP 8.2
# ARN obtenidos de https://runtimes.bref.sh/
# Para PostgreSQL usaremos un layer custom
locals {
  bref_php_fpm_layer = "arn:aws:lambda:${var.aws_region}:534081306603:layer:php-82-fpm:66"
  bref_php_layer     = "arn:aws:lambda:${var.aws_region}:534081306603:layer:php-82:66"
  bref_console_layer = "arn:aws:lambda:${var.aws_region}:534081306603:layer:console:109"
}

# Lambda Function - API (CRUD + Login)
# SIN VPC para reducir costos y cold start
resource "aws_lambda_function" "api" {
  function_name = "${var.project_name}-api"
  role          = aws_iam_role.lambda_role.arn

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  handler     = "public/index.php"
  runtime     = "provided.al2"
  timeout     = 28
  memory_size = 1024

  layers = [local.bref_php_fpm_layer]

  # SIN VPC - Lambda puede acceder a RDS público directamente
  # Esto elimina la necesidad de NAT Gateway ($32/mes)

  environment {
    variables = {
      APP_ENV        = "dev"
      APP_DEBUG      = "1"
      APP_SECRET     = var.app_secret
      JWT_PASSPHRASE = var.jwt_passphrase
      JWT_SECRET_KEY = "/var/task/config/jwt/private.pem"
      JWT_PUBLIC_KEY = "/var/task/config/jwt/public.pem"
      DATABASE_URL   = "mysql://${var.db_username}:${var.db_password}@${aws_db_instance.mysql.endpoint}/${var.db_name}?serverVersion=8.0"
      DEFAULT_URI    = "https://${aws_apigatewayv2_api.main.id}.execute-api.${var.aws_region}.amazonaws.com"
    }
  }

  tags = {
    Name = "${var.project_name}-api"
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda_api,
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy.lambda_secrets
  ]
}

# Lambda Function - Console (para ejecutar migraciones y comandos)
# SIN VPC
resource "aws_lambda_function" "console" {
  function_name = "${var.project_name}-console"
  role          = aws_iam_role.lambda_role.arn

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  handler     = "bin/console"
  runtime     = "provided.al2"
  timeout     = 120
  memory_size = 1024

  layers = [
    local.bref_php_layer,
    local.bref_console_layer
  ]

  # SIN VPC

  environment {
    variables = {
      APP_ENV        = "dev"
      APP_SECRET     = var.app_secret
      JWT_PASSPHRASE = var.jwt_passphrase
      JWT_SECRET_KEY = "/var/task/config/jwt/private.pem"
      JWT_PUBLIC_KEY = "/var/task/config/jwt/public.pem"
      DATABASE_URL   = "mysql://${var.db_username}:${var.db_password}@${aws_db_instance.mysql.endpoint}/${var.db_name}?serverVersion=8.0"
      DEFAULT_URI    = "https://${aws_apigatewayv2_api.main.id}.execute-api.${var.aws_region}.amazonaws.com"
    }
  }

  tags = {
    Name = "${var.project_name}-console"
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda_console,
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy.lambda_secrets
  ]
}

# Permission para API Gateway invocar Lambda
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "alb" {
  statement_id  = "AllowALBInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "elasticloadbalancing.amazonaws.com"
  source_arn    = aws_lb_target_group.lambda.arn
}
