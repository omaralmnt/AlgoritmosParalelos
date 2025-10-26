# API Gateway HTTP API
resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"
  description   = "API Gateway para backend CRUD + Login con autenticación por API Key"

  cors_configuration {
    allow_origins = ["*"] # En producción, especifica el dominio de tu frontend
    allow_methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    allow_headers = [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-API-Key"
    ]
    expose_headers = ["Content-Length", "X-Request-Id"]
    max_age        = 3600
  }

  tags = {
    Name = "${var.project_name}-api"
  }
}

# Integration con Lambda
resource "aws_apigatewayv2_integration" "lambda" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"

  integration_uri        = aws_lambda_function.api.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

# Route catch-all (captura todas las rutas)
resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "$default"

  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "CUSTOM"
  authorizer_id      = aws_apigatewayv2_authorizer.api_key.id
}

# Authorizer personalizado para API Key
resource "aws_apigatewayv2_authorizer" "api_key" {
  api_id           = aws_apigatewayv2_api.main.id
  authorizer_type  = "REQUEST"
  name             = "${var.project_name}-api-key-authorizer"

  authorizer_uri                    = aws_lambda_function.authorizer.invoke_arn
  authorizer_payload_format_version = "2.0"
  enable_simple_responses           = true

  identity_sources = ["$request.header.X-API-Key"]

  authorizer_result_ttl_in_seconds = 300
}

# Lambda Authorizer para validar API Key
resource "aws_lambda_function" "authorizer" {
  function_name = "${var.project_name}-authorizer"
  role          = aws_iam_role.lambda_role.arn

  filename         = "${path.module}/authorizer.zip"
  source_code_hash = data.archive_file.authorizer_zip.output_base64sha256

  handler = "index.handler"
  runtime = "nodejs20.x"
  timeout = 5

  environment {
    variables = {
      API_KEY = random_password.api_key.result
    }
  }

  tags = {
    Name = "${var.project_name}-authorizer"
  }
}

# Código del authorizer
data "archive_file" "authorizer_zip" {
  type        = "zip"
  output_path = "${path.module}/authorizer.zip"

  source {
    content  = <<EOF
exports.handler = async (event) => {
  const apiKey = event.headers['x-api-key'];
  const expectedApiKey = process.env.API_KEY;

  console.log('Validating API Key...');

  if (!apiKey) {
    console.log('No API Key provided');
    return {
      isAuthorized: false
    };
  }

  if (apiKey === expectedApiKey) {
    console.log('API Key valid');
    return {
      isAuthorized: true
    };
  }

  console.log('Invalid API Key');
  return {
    isAuthorized: false
  };
};
EOF
    filename = "index.js"
  }
}

# Permission para API Gateway invocar Lambda Authorizer
resource "aws_lambda_permission" "authorizer" {
  statement_id  = "AllowAPIGatewayInvokeAuthorizer"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.authorizer.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# Generar API Key aleatoria
resource "random_password" "api_key" {
  length  = 32
  special = false
}

# Guardar API Key en Secrets Manager
resource "aws_secretsmanager_secret" "api_key" {
  name                    = "${var.project_name}-api-key-${var.environment}"
  recovery_window_in_days = 7

  tags = {
    Name = "${var.project_name}-api-key"
  }
}

resource "aws_secretsmanager_secret_version" "api_key" {
  secret_id     = aws_secretsmanager_secret.api_key.id
  secret_string = random_password.api_key.result
}

# Stage
resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
      errorMessage   = "$context.error.message"
      authorizerError = "$context.authorizer.error"
    })
  }

  tags = {
    Name = "${var.project_name}-${var.environment}"
  }
}

# CloudWatch Log Group para API Gateway
resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.project_name}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-api-gateway-logs"
  }
}
