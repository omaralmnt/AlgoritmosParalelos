# Integration con API Gateway existente para Email Publisher
resource "aws_apigatewayv2_integration" "email_publisher" {
  api_id           = var.api_gateway_id
  integration_type = "AWS_PROXY"

  integration_uri        = aws_lambda_function.email_publisher.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

# Ruta específica para enviar emails: POST /notify/email
resource "aws_apigatewayv2_route" "email_send" {
  api_id    = var.api_gateway_id
  route_key = "POST /notify/email"

  target             = "integrations/${aws_apigatewayv2_integration.email_publisher.id}"
  authorization_type = "CUSTOM"
  authorizer_id      = var.api_gateway_authorizer_id
}

# Permission para API Gateway invocar Email Publisher
resource "aws_lambda_permission" "email_publisher_api_gateway" {
  statement_id  = "AllowAPIGatewayInvokeEmailPublisher"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.email_publisher.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/*/notify/email"
}
